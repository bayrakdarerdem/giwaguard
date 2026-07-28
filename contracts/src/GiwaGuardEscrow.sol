// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title GiwaGuardEscrow
/// @notice A minimal, transparent escrow contract for freelance-style jobs on GIWA.
///         Client posts a job and funds it with native ETH. Freelancer submits proof
///         of delivery. Client approves, and funds release automatically. Either side
///         is protected against silent disappearance by an explicit dispute/refund path.
///
///         Identity trust layer: GIWA's ecosystem includes "Dojang", an EAS-based
///         attestation service (issued by Upbit Korea) that links a wallet address to
///         KYC-verified off-chain identity without exposing PII. This contract exposes
///         an admin-settable `verifiedIdentity` mapping as a stand-in for that
///         attestation check. Once GIWA publishes a stable Dojang/EAS registry address
///         for the testnet, `isVerified()` can be swapped to read directly from that
///         registry instead of the local mapping — the rest of the contract does not
///         need to change.
contract GiwaGuardEscrow {
    enum Status {
        Open,       // job created, awaiting funding
        Funded,     // client has locked payment in escrow
        Submitted,  // freelancer has submitted delivery proof
        Completed,  // client approved, funds released to freelancer
        Refunded    // client or arbiter refunded the client
    }

    struct Job {
        address client;
        address freelancer;
        uint256 amount;
        string description;   // short title/description
        string proofURI;      // freelancer-submitted proof of delivery (URL, hash, etc.)
        Status status;
        uint256 createdAt;
    }

    address public admin;
    uint256 public jobCount;
    mapping(uint256 => Job) public jobs;

    /// @dev Stand-in for a Dojang "Verified Address" attestation lookup.
    ///      See contract-level notice above.
    mapping(address => bool) public verifiedIdentity;

    event JobCreated(uint256 indexed jobId, address indexed client, address indexed freelancer, string description);
    event JobFunded(uint256 indexed jobId, uint256 amount);
    event JobSubmitted(uint256 indexed jobId, string proofURI);
    event JobCompleted(uint256 indexed jobId, uint256 amount);
    event JobRefunded(uint256 indexed jobId, uint256 amount);
    event IdentityVerified(address indexed account, bool verified);

    modifier onlyAdmin() {
        require(msg.sender == admin, "not admin");
        _;
    }

    modifier onlyClient(uint256 jobId) {
        require(msg.sender == jobs[jobId].client, "not client");
        _;
    }

    modifier onlyFreelancer(uint256 jobId) {
        require(msg.sender == jobs[jobId].freelancer, "not freelancer");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    /// @notice Admin-controlled stand-in for Dojang attestation verification.
    ///         Marks `account` as identity-verified (or revokes it).
    function setVerified(address account, bool verified) external onlyAdmin {
        verifiedIdentity[account] = verified;
        emit IdentityVerified(account, verified);
    }

    function isVerified(address account) public view returns (bool) {
        return verifiedIdentity[account];
    }

    /// @notice Create a new job. Does not lock funds yet — call fund() next.
    function createJob(address freelancer, string calldata description) external returns (uint256 jobId) {
        require(freelancer != address(0), "invalid freelancer");
        jobId = jobCount++;
        jobs[jobId] = Job({
            client: msg.sender,
            freelancer: freelancer,
            amount: 0,
            description: description,
            proofURI: "",
            status: Status.Open,
            createdAt: block.timestamp
        });
        emit JobCreated(jobId, msg.sender, freelancer, description);
    }

    /// @notice Client locks payment for the job in escrow.
    function fund(uint256 jobId) external payable onlyClient(jobId) {
        Job storage job = jobs[jobId];
        require(job.status == Status.Open, "job not open");
        require(msg.value > 0, "amount must be > 0");
        job.amount = msg.value;
        job.status = Status.Funded;
        emit JobFunded(jobId, msg.value);
    }

    /// @notice Freelancer submits proof of delivery (e.g. a URL or content hash).
    function submit(uint256 jobId, string calldata proofURI) external onlyFreelancer(jobId) {
        Job storage job = jobs[jobId];
        require(job.status == Status.Funded, "job not funded");
        job.proofURI = proofURI;
        job.status = Status.Submitted;
        emit JobSubmitted(jobId, proofURI);
    }

    /// @notice Client approves the delivered work; escrow releases to freelancer.
    function approve(uint256 jobId) external onlyClient(jobId) {
        Job storage job = jobs[jobId];
        require(job.status == Status.Submitted, "job not submitted");
        job.status = Status.Completed;
        uint256 amount = job.amount;
        (bool ok, ) = job.freelancer.call{value: amount}("");
        require(ok, "transfer failed");
        emit JobCompleted(jobId, amount);
    }

    /// @notice Client can reclaim funds if the job was funded but never submitted.
    function refund(uint256 jobId) external onlyClient(jobId) {
        Job storage job = jobs[jobId];
        require(job.status == Status.Funded, "only refundable when funded and unsubmitted");
        job.status = Status.Refunded;
        uint256 amount = job.amount;
        (bool ok, ) = job.client.call{value: amount}("");
        require(ok, "transfer failed");
        emit JobRefunded(jobId, amount);
    }

    function getJob(uint256 jobId) external view returns (Job memory) {
        return jobs[jobId];
    }
}
