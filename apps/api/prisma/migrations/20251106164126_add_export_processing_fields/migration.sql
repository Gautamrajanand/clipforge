-- Add processing fields to Export table (ADDITIVE ONLY)
-- These fields track video processing status for aspect ratio conversion

-- Processing status: PENDING, PROCESSING, COMPLETED, FAILED
ALTER TABLE "Export" ADD COLUMN IF NOT EXISTS "processingStatus" VARCHAR;

-- URL to processed video (after aspect ratio conversion)
ALTER TABLE "Export" ADD COLUMN IF NOT EXISTS "processedUrl" VARCHAR;

-- Error message if processing failed
ALTER TABLE "Export" ADD COLUMN IF NOT EXISTS "processingError" TEXT;

-- Processing started timestamp
ALTER TABLE "Export" ADD COLUMN IF NOT EXISTS "processingStartedAt" TIMESTAMP;

-- Processing completed timestamp
ALTER TABLE "Export" ADD COLUMN IF NOT EXISTS "processingCompletedAt" TIMESTAMP;
