-- CreateEnum for referral status
CREATE TYPE "ReferralStatus" AS ENUM ('PENDING', 'COMPLETED', 'REWARDED');

-- Add referral fields to Organization
ALTER TABLE "Organization" ADD COLUMN "referralCode" VARCHAR(10) UNIQUE;
ALTER TABLE "Organization" ADD COLUMN "referredBy" VARCHAR(50);
ALTER TABLE "Organization" ADD COLUMN "referralRewardClaimed" BOOLEAN DEFAULT false;

-- Create Referral tracking table
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL,
    "referrerOrgId" TEXT NOT NULL,
    "referredOrgId" TEXT NOT NULL,
    "referralCode" VARCHAR(10) NOT NULL,
    "status" "ReferralStatus" NOT NULL DEFAULT 'PENDING',
    "referrerReward" INTEGER NOT NULL DEFAULT 30,
    "referredReward" INTEGER NOT NULL DEFAULT 30,
    "referrerRewarded" BOOLEAN NOT NULL DEFAULT false,
    "referredRewarded" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- Create indexes for performance
CREATE INDEX "Organization_referralCode_idx" ON "Organization"("referralCode");
CREATE INDEX "Organization_referredBy_idx" ON "Organization"("referredBy");
CREATE INDEX "Referral_referrerOrgId_idx" ON "Referral"("referrerOrgId");
CREATE INDEX "Referral_referredOrgId_idx" ON "Referral"("referredOrgId");
CREATE INDEX "Referral_referralCode_idx" ON "Referral"("referralCode");
CREATE INDEX "Referral_status_idx" ON "Referral"("status");

-- Add foreign key constraints
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referrerOrgId_fkey" FOREIGN KEY ("referrerOrgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referredOrgId_fkey" FOREIGN KEY ("referredOrgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
