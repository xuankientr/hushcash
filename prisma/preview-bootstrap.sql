BEGIN;
SET LOCAL search_path TO public;

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'COMPLETE', 'FAILED');

-- CreateEnum
CREATE TYPE "PaymentRequestStatus" AS ENUM ('ACTIVE', 'PAID', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ClaimableLinkStatus" AS ENUM ('FUNDING', 'FUNDING_FAILED', 'CLAIMING', 'REFUNDING', 'REFUNDED', 'UNCLAIMED', 'CLAIMED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "privyDid" TEXT,
    "twitterId" TEXT,
    "twitterHandle" TEXT,
    "twitterName" TEXT,
    "twitterAvatar" TEXT,
    "email" TEXT,
    "username" TEXT,
    "walletId" TEXT,
    "walletAddress" TEXT,
    "unlinkAddress" TEXT,
    "unlinkMnemonic" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfers" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT,
    "toAddress" TEXT,
    "amountUsdc" TEXT NOT NULL,
    "note" TEXT,
    "status" "TransferStatus" NOT NULL DEFAULT 'PENDING',
    "circleTransferId" TEXT,
    "txHash" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "paymentKey" TEXT,
    "sourceWalletId" TEXT,
    "shelbyReceiptUrl" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "unlinkTxId" TEXT,

    CONSTRAINT "transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_requests" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "amountUsdc" TEXT,
    "note" TEXT,
    "status" "PaymentRequestStatus" NOT NULL DEFAULT 'ACTIVE',
    "splitGroup" TEXT,
    "participant" TEXT,

    CONSTRAINT "payment_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claimable_links" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "senderId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "amountUsdc" TEXT NOT NULL,
    "note" TEXT,
    "status" "ClaimableLinkStatus" NOT NULL DEFAULT 'UNCLAIMED',
    "claimedBy" TEXT,
    "claimedAt" TIMESTAMP(3),
    "escrowWalletId" TEXT,
    "escrowAddress" TEXT,
    "fundingKey" TEXT,
    "fundingId" TEXT,
    "fundingWalletId" TEXT,
    "payoutKey" TEXT,
    "payoutId" TEXT,
    "payoutAddress" TEXT,

    CONSTRAINT "claimable_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amountUsdc" TEXT NOT NULL,
    "proofNote" TEXT,
    "proofImageUrl" TEXT,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "shelbyReceiptUrl" TEXT,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "handle" TEXT,
    "address" TEXT,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waitlist" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,

    CONSTRAINT "waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_privyDid_key" ON "users"("privyDid");

-- CreateIndex
CREATE UNIQUE INDEX "users_twitterId_key" ON "users"("twitterId");

-- CreateIndex
CREATE UNIQUE INDEX "users_twitterHandle_key" ON "users"("twitterHandle");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_walletId_key" ON "users"("walletId");

-- CreateIndex
CREATE UNIQUE INDEX "users_walletAddress_key" ON "users"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "users_unlinkAddress_key" ON "users"("unlinkAddress");

-- CreateIndex
CREATE UNIQUE INDEX "transfers_paymentKey_key" ON "transfers"("paymentKey");

-- CreateIndex
CREATE UNIQUE INDEX "payment_requests_code_key" ON "payment_requests"("code");

-- CreateIndex
CREATE INDEX "payment_requests_userId_createdAt_idx" ON "payment_requests"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "claimable_links_code_key" ON "claimable_links"("code");

-- CreateIndex
CREATE UNIQUE INDEX "claimable_links_fundingKey_key" ON "claimable_links"("fundingKey");

-- CreateIndex
CREATE INDEX "claimable_links_senderId_createdAt_idx" ON "claimable_links"("senderId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_code_key" ON "invoices"("code");

-- CreateIndex
CREATE UNIQUE INDEX "waitlist_email_key" ON "waitlist"("email");

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_requests" ADD CONSTRAINT "payment_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claimable_links" ADD CONSTRAINT "claimable_links_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Tables are accessed through server-side Prisma.
ALTER TABLE public."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."transfers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."payment_requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."claimable_links" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."invoices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."contacts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."waitlist" ENABLE ROW LEVEL SECURITY;

COMMIT;
