# HushCash

Private payments on Arc. Send, request, and drop USDC — without exposing your identity on-chain.

🌐 [hushcash.xyz](https://hushcash.xyz)

---

## Overview

HushCash is a non-custodial payments app built natively on Arc. It uses USDC as both the payment token and gas, with wallets powered by Circle Developer Controlled Wallets (DCW).

Users can send USDC by X (Twitter) handle, wallet address, or shareable link — without revealing their identity to the recipient.

## Features

- **Send** — Pay anyone by @handle, 0x address, or pay link
- **Request** — Generate a shareable payment link for a fixed or open amount
- **Drop Cash** — Pre-load a claimable link; anyone with the link can claim the funds
- **HushCash Pay** — Merchant payments via QR code, with live USDC/VND conversion

## Smart Contracts

| Contract | Network | Address |
|----------|---------|---------|
| DropCashEscrow | Arc Testnet | [`0x395F664bd86945074eE8145c947bc3A2887E4F7F`](https://testnet.arcscan.app/address/0x395F664bd86945074eE8145c947bc3A2887E4F7F) |
| PrivacyRouter *(coming soon)* | Arc Testnet | Pending ArcaneVM availability |

Contract source: [`contracts/contracts/DropCashEscrow.sol`](contracts/contracts/DropCashEscrow.sol)

> Once ArcaneVM is live on Arc Testnet, HushCash will deploy a confidential payment router that processes transfers inside a hardware-secured enclave — making transaction data cryptographically private at the protocol level.

## Tech Stack

- **Frontend / API** — Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Auth** — Privy (X / email login)
- **Wallets** — Circle Developer Controlled Wallets (DCW)
- **Chain** — Arc Testnet (Chain ID 5042002, native USDC)
- **Database** — PostgreSQL (Supabase)
- **Contracts** — Solidity 0.8.24, Hardhat

## Arc Network

| | |
|-|-|
| Chain ID | 5042002 |
| RPC | `https://rpc.testnet.arc.network` |
| Gas token | USDC (native) |
| Explorer | [testnet.arcscan.app](https://testnet.arcscan.app) |

## Project Structure

```
app/          # Next.js app (pages + API routes)
components/   # React components
lib/          # Circle, Privy, Prisma clients
prisma/       # Database schema
contracts/    # Solidity contracts + Hardhat
public/       # Static assets
```

## Status

HushCash is currently in **waitlist mode** on Arc Testnet. On-chain privacy via ArcaneVM will be integrated once available on testnet.

Join the waitlist at [hushcash.xyz](https://hushcash.xyz).