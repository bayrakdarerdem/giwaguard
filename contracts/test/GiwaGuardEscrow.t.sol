// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {GiwaGuardEscrow} from "../src/GiwaGuardEscrow.sol";

contract GiwaGuardEscrowTest is Test {
    GiwaGuardEscrow escrow;

    address admin = address(this);
    address client = address(0xC11E17);
    address freelancer = address(0xF3EE1A);

    function setUp() public {
        escrow = new GiwaGuardEscrow();
        vm.deal(client, 10 ether);
    }

    function test_FullHappyPath() public {
        vm.prank(client);
        uint256 jobId = escrow.createJob(freelancer, "Build a landing page");

        vm.prank(client);
        escrow.fund{value: 1 ether}(jobId);

        vm.prank(freelancer);
        escrow.submit(jobId, "ipfs://proof123");

        uint256 balBefore = freelancer.balance;
        vm.prank(client);
        escrow.approve(jobId);

        assertEq(freelancer.balance, balBefore + 1 ether);
        (, , uint256 amount, , , GiwaGuardEscrow.Status status, ) = escrow.jobs(jobId);
        assertEq(uint256(status), uint256(GiwaGuardEscrow.Status.Completed));
        assertEq(amount, 1 ether);
    }

    function test_RefundWhenFundedButNotSubmitted() public {
        vm.prank(client);
        uint256 jobId = escrow.createJob(freelancer, "Design a logo");

        vm.prank(client);
        escrow.fund{value: 0.5 ether}(jobId);

        uint256 balBefore = client.balance;
        vm.prank(client);
        escrow.refund(jobId);

        assertEq(client.balance, balBefore + 0.5 ether);
    }

    function test_RevertWhen_NonFreelancerSubmits() public {
        vm.prank(client);
        uint256 jobId = escrow.createJob(freelancer, "Write copy");
        vm.prank(client);
        escrow.fund{value: 0.2 ether}(jobId);

        vm.expectRevert("not freelancer");
        vm.prank(client);
        escrow.submit(jobId, "ipfs://nope");
    }

    function test_VerifiedIdentityFlag() public {
        assertFalse(escrow.isVerified(client));
        escrow.setVerified(client, true);
        assertTrue(escrow.isVerified(client));
    }
}
