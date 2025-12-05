/*
  Warnings:

  - A unique constraint covering the columns `[referralCode]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ReferralStatus" AS ENUM ('PENDING', 'COMPLETED', 'REWARDED');

-- CreateEnum
CREATE TYPE "NPSCategory" AS ENUM ('DETRACTOR', 'PASSIVE', 'PROMOTER');

-- CreateEnum
CREATE TYPE "FeedbackType" AS ENUM ('BUG', 'FEATURE_REQUEST', 'IMPROVEMENT', 'COMPLAINT', 'PRAISE', 'OTHER');

-- CreateEnum
CREATE TYPE "PopupType" AS ENUM ('WELCOME', 'FEATURE_ANNOUNCEMENT', 'UPGRADE_NUDGE', 'SURVEY', 'FEEDBACK', 'CUSTOM');

-- AlterEnum
ALTER TYPE "CreditTransactionType" ADD VALUE 'ADDITION_REFERRAL_BONUS';

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "currentOnboardingStep" TEXT NOT NULL DEFAULT 'WELCOME',
ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onboardingCompletedAt" TIMESTAMP(3),
ADD COLUMN     "onboardingSkipped" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "referralCode" VARCHAR(10),
ADD COLUMN     "referralRewardClaimed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "referredBy" VARCHAR(50);

-- CreateTable
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

-- CreateTable
CREATE TABLE "OnboardingProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentStep" TEXT NOT NULL DEFAULT 'WELCOME',
    "completedSteps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "skippedSteps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hasCreatedClip" BOOLEAN NOT NULL DEFAULT false,
    "hasAddedSubtitles" BOOLEAN NOT NULL DEFAULT false,
    "hasReframedVideo" BOOLEAN NOT NULL DEFAULT false,
    "hasShared" BOOLEAN NOT NULL DEFAULT false,
    "firstClipAt" TIMESTAMP(3),
    "firstSubtitleAt" TIMESTAMP(3),
    "firstReframeAt" TIMESTAMP(3),
    "firstShareAt" TIMESTAMP(3),
    "exportCount" INTEGER NOT NULL DEFAULT 0,
    "lastExportAt" TIMESTAMP(3),

    CONSTRAINT "OnboardingProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NPSResponse" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "feedback" TEXT,
    "category" "NPSCategory" NOT NULL,
    "context" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NPSResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "type" "FeedbackType" NOT NULL,
    "message" TEXT NOT NULL,
    "rating" INTEGER,
    "page" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingContent" (
    "id" TEXT NOT NULL,
    "step" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "imageUrl" TEXT,
    "ctaText" TEXT NOT NULL DEFAULT 'Next',
    "ctaUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PopupContent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PopupType" NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "content" TEXT NOT NULL,
    "ctaText" TEXT NOT NULL,
    "ctaUrl" TEXT,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "showAfter" INTEGER,
    "showOnPages" TEXT[],
    "frequency" TEXT NOT NULL DEFAULT 'once',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PopupContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Referral_referrerOrgId_idx" ON "Referral"("referrerOrgId");

-- CreateIndex
CREATE INDEX "Referral_referredOrgId_idx" ON "Referral"("referredOrgId");

-- CreateIndex
CREATE INDEX "Referral_referralCode_idx" ON "Referral"("referralCode");

-- CreateIndex
CREATE INDEX "Referral_status_idx" ON "Referral"("status");

-- CreateIndex
CREATE INDEX "Referral_createdAt_idx" ON "Referral"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingProgress_userId_key" ON "OnboardingProgress"("userId");

-- CreateIndex
CREATE INDEX "OnboardingProgress_userId_idx" ON "OnboardingProgress"("userId");

-- CreateIndex
CREATE INDEX "OnboardingProgress_hasCreatedClip_idx" ON "OnboardingProgress"("hasCreatedClip");

-- CreateIndex
CREATE INDEX "NPSResponse_userId_idx" ON "NPSResponse"("userId");

-- CreateIndex
CREATE INDEX "NPSResponse_orgId_idx" ON "NPSResponse"("orgId");

-- CreateIndex
CREATE INDEX "NPSResponse_score_idx" ON "NPSResponse"("score");

-- CreateIndex
CREATE INDEX "NPSResponse_category_idx" ON "NPSResponse"("category");

-- CreateIndex
CREATE INDEX "NPSResponse_createdAt_idx" ON "NPSResponse"("createdAt");

-- CreateIndex
CREATE INDEX "Feedback_userId_idx" ON "Feedback"("userId");

-- CreateIndex
CREATE INDEX "Feedback_orgId_idx" ON "Feedback"("orgId");

-- CreateIndex
CREATE INDEX "Feedback_type_idx" ON "Feedback"("type");

-- CreateIndex
CREATE INDEX "Feedback_resolved_idx" ON "Feedback"("resolved");

-- CreateIndex
CREATE INDEX "Feedback_createdAt_idx" ON "Feedback"("createdAt");

-- CreateIndex
CREATE INDEX "OnboardingContent_isActive_idx" ON "OnboardingContent"("isActive");

-- CreateIndex
CREATE INDEX "OnboardingContent_order_idx" ON "OnboardingContent"("order");

-- CreateIndex
CREATE INDEX "PopupContent_isActive_idx" ON "PopupContent"("isActive");

-- CreateIndex
CREATE INDEX "PopupContent_type_idx" ON "PopupContent"("type");

-- CreateIndex
CREATE INDEX "PopupContent_priority_idx" ON "PopupContent"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_referralCode_key" ON "Organization"("referralCode");
