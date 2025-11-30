/*
  Warnings:

  - Made the column `referralRewardClaimed` on table `Organization` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "CreditTransactionType" ADD VALUE 'ADDITION_REFERRAL_BONUS';

-- DropForeignKey
ALTER TABLE "Referral" DROP CONSTRAINT "Referral_referredOrgId_fkey";

-- DropForeignKey
ALTER TABLE "Referral" DROP CONSTRAINT "Referral_referrerOrgId_fkey";

-- DropIndex
DROP INDEX "Organization_referralCode_idx";

-- DropIndex
DROP INDEX "Organization_referredBy_idx";

-- AlterTable
ALTER TABLE "Organization" ALTER COLUMN "referralRewardClaimed" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Referral_createdAt_idx" ON "Referral"("createdAt");
