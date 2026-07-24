# HushCash

Private peer-to-peer payments on Arc. Send, request, invoice, and drop USDC — with a wallet that sets itself up automatically.

🌐 [hushcash.xyz](https://hushcash.xyz)

---

## Overview

HushCash is a non-custodial payments app built natively on Arc. Users sign in with email via Privy and get a Circle Developer Controlled Wallet created for them automatically — no seed phrases, no setup friction.

USDC is both the payment token and the gas token on Arc, so every action in the app costs USDC with no ETH required.

## Features

- **Send** — Pay anyone by @username or wallet address
- **Request** — Generate a shareable payment link; anyone can pay without an account
- **Invoice** — Create an invoice with an amount, description, and proof of work (photo, gallery upload, or URL); share a link; payer settles in one tap
- **Drop Cash** — Pre-load a claimable link backed by on-chain escrow; whoever has the link can claim the funds
- **Username** — Claim a unique @handle; others can pay you by name instead of address
- **Settings** — View balance, activity history, deposit address, and withdraw to any wallet

## Smart Contracts

Both contracts are deployed on Arc Testnet.

| Contract | Address |
|----------|---------|
| DropCashEscrow | [`0x31D4F6B87E042D4849B586880d30c0D6102Ba2cd`](https://testnet.arcscan.app/address/0x31D4F6B87E042D4849B586880d30c0D6102Ba2cd) |
| InvoiceRegistry | [`0x87090C9d427e71c8E2661D483a11A8DeE3a9Bd88`](https://testnet.arcscan.app/address/0x87090C9d427e71c8E2661D483a11A8DeE3a9Bd88) |

**DropCashEscrow** — trustless escrow for drop links. Creator deposits USDC locked to a `keccak256(code)` hash; claimant proves knowledge of the code to withdraw.

**InvoiceRegistry** — on-chain invoice lifecycle. Service provider registers an invoice by code + amount; client pays with exact native USDC; funds transfer directly to the creator.

Source: [`contracts/contracts/`](contracts/contracts/)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend / API | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| Auth | Privy (email login) |
| Wallets | Circle Developer Controlled Wallets (DCW) |
| Chain | Arc Testnet — Chain ID 5042002, native USDC |
| Database | PostgreSQL via Supabase + Prisma ORM |
| Contracts | Solidity 0.8.24, Hardhat |
| Hosting | Vercel |

## Arc Network

| | |
|-|-|
| Chain ID | 5042002 |
| RPC | `https://rpc.testnet.arc.network` |
| Gas token | USDC (native) |
| Explorer | [testnet.arcscan.app](https://testnet.arcscan.app) |
| Faucet | [faucet.testnet.arc.network](https://faucet.testnet.arc.network) |

## Project Structure

```
app/
  (app)/          # Authenticated pages (dashboard, settings, invoice/new)
  invoice/[code]/ # Public invoice page
  pay/[code]/     # Public pay-request page
  api/            # API routes (transfer, invoice, drop, user, wallet)
components/       # React UI components
lib/              # Circle, Privy, Prisma clients + utilities
prisma/           # Database schema
contracts/        # Solidity contracts + Hardhat config
public/           # Static assets
```

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Fill in DATABASE_URL, PRIVY_*, CIRCLE_* values

# Push schema to database
npx prisma db push

# Run dev server
npm run dev
```

## Deploying Contracts

```bash
cd contracts
npm install
npx hardhat run scripts/deploy.ts --network arc-testnet
```

Requires `PRIVATE_KEY` in `contracts/.env` — the deployer wallet needs Arc Testnet USDC for gas.

## Status

HushCash is live in **waitlist mode** on Arc Testnet. Join at [hushcash.xyz](https://hushcash.xyz).