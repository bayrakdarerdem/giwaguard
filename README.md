# GiwaGuard

An identity-aware, on-chain escrow marketplace for freelance work, built for Dunamu/Upbit's **GASOK MVP Build Phase** on the **GIWA** testnet.

Ported from [freelance-arc](https://github.com/bayrakdarerdem/freelance-arc) (originally built on Arc Testnet) — the Next.js/Supabase UI skeleton is reused, but the escrow contract, wallet layer, and identity narrative are rebuilt for GIWA.

---

## What is GiwaGuard?

Every job is governed by a smart contract on GIWA Sepolia:
1. Client posts a job — `createJob()` on-chain
2. Client locks ETH into escrow — `fund()`
3. Freelancer delivers the work — `submit()` records proof on-chain
4. Client approves — `approve()` automatically releases ETH to the freelancer
5. If work is never submitted, the client can `refund()` and reclaim funds

---

## Why GIWA?

GIWA positions itself around making Web3 **accessible** to Upbit's mainstream user base, not just crypto natives. GiwaGuard leans into that by building around GIWA's own trust layer:

- **Dojang** — GIWA's EAS-based attestation service (issued by Upbit Korea) links a wallet address to KYC-verified off-chain identity without exposing PII. `GiwaGuardEscrow.sol` exposes an admin-settable `verifiedIdentity` mapping as a placeholder for a real Dojang/EAS registry lookup — once GIWA publishes a stable testnet registry address, `isVerified()` can be swapped to read from it directly with no other contract changes.
- Native ETH escrow (GIWA testnet has no native USDC/Circle wallet support like Arc does)
- Deployed and verified on GIWA Sepolia, explorer-visible end to end

---

## What changed vs. freelance-arc (Arc Testnet)

| | freelance-arc (Arc) | GiwaGuard (GIWA) |
|---|---|---|
| Escrow contract | Arc's built-in ERC-8183 AgenticCommerce contract | Custom `GiwaGuardEscrow.sol`, written and deployed for this project |
| Wallet layer | Circle Developer Controlled Wallets | viem + private-key signer (demo), ready for MetaMask wallet-connect |
| Escrow currency | USDC (Arc's native precompile) | Native ETH |
| Identity | — | Dojang-ready `verifiedIdentity` hook |
| Agent-to-agent demo | ERC-8183-specific, Arc only | descoped (not applicable to GIWA) |

---

## Tech Stack

Frontend: Next.js + Tailwind CSS
Backend: viem + Supabase
Blockchain: GIWA Sepolia Testnet (EVM-compatible, OP Stack, Chain ID 91342)
Contracts: Solidity, built and tested with Foundry

---

## Contract

**GiwaGuardEscrow**: `0xfF03db8A28e248fdc5502001eBBdBE9dec771ae0`
Verified on GIWA Explorer: https://sepolia-explorer.giwa.io/address/0xfF03db8A28e248fdc5502001eBBdBE9dec771ae0#code

Source, tests, and deploy script: see `/contracts` (Foundry project).

---

## Links

- GIWA Docs: https://docs.giwa.io
- GIWA Sepolia Explorer: https://sepolia-explorer.giwa.io
- GIWA Faucets: https://docs.giwa.io/get-started/faucets
- GIWA Bridge: https://bridge-giwa.vercel.app
