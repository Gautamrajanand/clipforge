-- AlterEnum
ALTER TYPE "Tier" ADD VALUE 'STARTER';

-- AlterTable: Add credit system fields to Organization
ALTER TABLE "Organization" ADD COLUMN "credits" INTEGER NOT NULL DEFAULT 60;
ALTER TABLE "Organization" ADD COLUMN "creditsResetDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Organization" ADD COLUMN "creditsUsedThisMonth" INTEGER NOT NULL DEFAULT 0;

-- AlterTable: Add Stripe fields to Organization
ALTER TABLE "Organization" ADD COLUMN "stripeCustomerId" TEXT;
ALTER TABLE "Organization" ADD COLUMN "stripeSubscriptionId" TEXT;
ALTER TABLE "Organization" ADD COLUMN "stripePriceId" TEXT;
ALTER TABLE "Organization" ADD COLUMN "stripeCurrentPeriodEnd" TIMESTAMP(3);

-- AlterTable: Add trial fields to Organization
ALTER TABLE "Organization" ADD COLUMN "trialStartDate" TIMESTAMP(3);
ALTER TABLE "Organization" ADD COLUMN "trialEndDate" TIMESTAMP(3);
ALTER TABLE "Organization" ADD COLUMN "trialUsed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: Add credit tracking to Project
ALTER TABLE "Project" ADD COLUMN "creditsUsed" INTEGER;
ALTER TABLE "Project" ADD COLUMN "expiresAt" TIMESTAMP(3);

-- CreateTable: CreditTransaction
CREATE TABLE "CreditTransaction" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "balanceBefore" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "projectId" TEXT,
    "videoDuration" DOUBLE PRECISION,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_stripeCustomerId_key" ON "Organization"("stripeCustomerId");
CREATE UNIQUE INDEX "Organization_stripeSubscriptionId_key" ON "Organization"("stripeSubscriptionId");
CREATE INDEX "Organization_stripeCustomerId_idx" ON "Organization"("stripeCustomerId");
CREATE INDEX "Organization_stripeSubscriptionId_idx" ON "Organization"("stripeSubscriptionId");
CREATE INDEX "Project_expiresAt_idx" ON "Project"("expiresAt");
CREATE INDEX "CreditTransaction_orgId_idx" ON "CreditTransaction"("orgId");
CREATE INDEX "CreditTransaction_type_idx" ON "CreditTransaction"("type");
CREATE INDEX "CreditTransaction_createdAt_idx" ON "CreditTransaction"("createdAt");

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
