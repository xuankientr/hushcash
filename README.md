# HushCash

Private peer-to-peer payments on Arc. Send, request, invoice, and drop USDC — with a wallet that sets itself up automatically.

🌐 [hushcash.xyz](https://hushcash.xyz)

---

## Overview

HushCash is a non-custodial payments app built natively on Arc. Users sign in with email via Privy and get a Circle Developer Controlled Wallet created for them automatically — no seed phrases, no setup friction.

## Features

- **Send** — Pay anyone by @username or wallet address; scan a QR code to fill the recipient instantly; tap a saved contact for one-tap sending
- **Request** — Generate a shareable payment link; optional split mode divides a total between people with custom % or fixed USDC amounts per person
- **Invoice** — Create and share an invoice with a title, amount, and optional proof of work. View or share the payment receipt after Circle confirms the transfer on Arc.
- **Payments** — Track your invoices and requests, see which participants paid their split shares, and copy links or confirmed receipts.
- **Drop Cash** — Fund an expiring claim link through a Circle-managed escrow wallet. The holder can claim to an Arc wallet without an account. The sender can refund unclaimed funds after expiry.
- **Contacts** — Save frequent recipients as named contacts; appears as quick-fill chips in the Send flow; stored per account
- **Notifications** — Badge on the Settings icon when new funds arrive; clears when the Activity tab is opened
- **Wallet** — Deposit, withdraw, and track balance; Activity tab auto-syncs pending transactions with the network on open
- **Username** — Claim a unique @handle; others can pay you by name or scan your profile QR

## Smart Contracts

Both contracts are deployed on Arc Testnet.

| Contract | Address |
|----------|---------|
| DropCashEscrow | [`0x31D4F6B87E042D4849B586880d30c0D6102Ba2cd`](https://testnet.arcscan.app/address/0x31D4F6B87E042D4849B586880d30c0D6102Ba2cd) |
| InvoiceRegistry | [`0x87090C9d427e71c8E2661D483a11A8DeE3a9Bd88`](https://testnet.arcscan.app/address/0x87090C9d427e71c8E2661D483a11A8DeE3a9Bd88) |
| PrivacyRouter *(coming soon)* | Pending Arc Privacy availability on testnet |

**DropCashEscrow** — standalone escrow contract source. The current web app funds and pays out drops through Circle Developer Controlled Wallets.

**InvoiceRegistry** — standalone invoice contract source. The current web app records invoices in PostgreSQL and settles them using confirmed Circle transfers.

**PrivacyRouter** *(coming soon)* — once Arc Privacy is live on Arc Testnet, HushCash will deploy a confidential payment router that routes transfers through Arc's confidential smart contract engine, making transaction data cryptographically private at the protocol level.

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
  api/            # API routes (transfer, invoice, drop, contacts, activity, wallet)
components/       # React UI components
hooks/            # Client-side hooks (useUnreadCount)
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

### Updating an existing database

For a database already on the schema from before Payments and Drop Cash, apply
`prisma/payments-and-drops.sql` once through the Supabase SQL editor or Prisma
against the direct database connection:

```bash
npx prisma db execute --file prisma/payments-and-drops.sql --url "$DIRECT_URL"
```

Old paid links retain their historical status. Receipt links require a verified
Circle transaction recorded by the new flow. Old requests without group data
appear as individual links.

New drops use Circle Smart Contract Accounts on Arc Testnet. Configure and
verify a Circle Gas Station policy that sponsors escrow payouts, then set
`DROP_GAS_SPONSORSHIP_ENABLED=true` in the deployment environment. Existing EOA
escrow wallets may need native USDC for gas. New drops can be tested end to end
by funding a drop, claiming to another wallet, and separately refunding an
expired drop.

## Deploying Contracts

```bash
cd contracts
npm install
npx hardhat run scripts/deploy.ts --network arc-testnet
```

Requires `PRIVATE_KEY` in `contracts/.env` — the deployer wallet needs Arc Testnet USDC for gas.

## Status

HushCash is live in **waitlist mode** on Arc Testnet. Join at [hushcash.xyz](https://hushcash.xyz).