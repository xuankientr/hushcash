-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ClaimableLinkStatus" ADD VALUE 'FUNDING';
ALTER TYPE "ClaimableLinkStatus" ADD VALUE 'FUNDING_FAILED';
ALTER TYPE "ClaimableLinkStatus" ADD VALUE 'CLAIMING';
ALTER TYPE "ClaimableLinkStatus" ADD VALUE 'REFUNDING';
ALTER TYPE "ClaimableLinkStatus" ADD VALUE 'REFUNDED';

-- AlterTable
ALTER TABLE "transfers" ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "paymentKey" TEXT,
ADD COLUMN     "sourceWalletId" TEXT;

-- AlterTable
ALTER TABLE "payment_requests" ADD COLUMN     "participant" TEXT,
ADD COLUMN     "splitGroup" TEXT;

-- AlterTable
ALTER TABLE "claimable_links" ADD COLUMN     "escrowAddress" TEXT,
ADD COLUMN     "fundingId" TEXT,
ADD COLUMN     "fundingKey" TEXT,
ADD COLUMN     "fundingWalletId" TEXT,
ADD COLUMN     "payoutAddress" TEXT,
ADD COLUMN     "payoutId" TEXT,
ADD COLUMN     "payoutKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "transfers_paymentKey_key" ON "transfers"("paymentKey");

-- CreateIndex
CREATE INDEX "payment_requests_userId_createdAt_idx" ON "payment_requests"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "claimable_links_fundingKey_key" ON "claimable_links"("fundingKey");

-- CreateIndex
CREATE INDEX "claimable_links_senderId_createdAt_idx" ON "claimable_links"("senderId", "createdAt");
