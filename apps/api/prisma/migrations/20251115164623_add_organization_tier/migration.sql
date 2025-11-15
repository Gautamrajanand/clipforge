-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('FREE', 'PRO', 'BUSINESS', 'ENTERPRISE');

-- DropForeignKey
ALTER TABLE "ApiKey" DROP CONSTRAINT "ApiKey_orgId_fkey";

-- DropForeignKey
ALTER TABLE "ApiKey" DROP CONSTRAINT "ApiKey_userId_fkey";

-- DropForeignKey
ALTER TABLE "Asset" DROP CONSTRAINT "Asset_projectId_fkey";

-- DropForeignKey
ALTER TABLE "BrandKit" DROP CONSTRAINT "BrandKit_orgId_fkey";

-- DropForeignKey
ALTER TABLE "Export" DROP CONSTRAINT "Export_momentId_fkey";

-- DropForeignKey
ALTER TABLE "Export" DROP CONSTRAINT "Export_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Membership" DROP CONSTRAINT "Membership_orgId_fkey";

-- DropForeignKey
ALTER TABLE "Membership" DROP CONSTRAINT "Membership_userId_fkey";

-- DropForeignKey
ALTER TABLE "Moment" DROP CONSTRAINT "Moment_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_orgId_fkey";

-- DropForeignKey
ALTER TABLE "Transcript" DROP CONSTRAINT "Transcript_projectId_fkey";

-- DropForeignKey
ALTER TABLE "UsageLedger" DROP CONSTRAINT "UsageLedger_orgId_fkey";

-- DropForeignKey
ALTER TABLE "Webhook" DROP CONSTRAINT "Webhook_orgId_fkey";

-- DropForeignKey
ALTER TABLE "Webhook" DROP CONSTRAINT "Webhook_userId_fkey";

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "tier" "Tier" NOT NULL DEFAULT 'FREE';

-- CreateIndex
CREATE INDEX "Organization_tier_idx" ON "Organization"("tier");
