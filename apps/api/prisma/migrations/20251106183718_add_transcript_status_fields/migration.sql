-- Add transcript status and external ID fields (ADDITIVE ONLY)
-- These fields enable AssemblyAI webhook integration

-- External transcript ID from AssemblyAI
ALTER TABLE "Transcript" ADD COLUMN IF NOT EXISTS "externalId" VARCHAR;

-- Processing status: PENDING, PROCESSING, COMPLETED, FAILED
ALTER TABLE "Transcript" ADD COLUMN IF NOT EXISTS "status" VARCHAR DEFAULT 'PENDING';

-- Completion timestamp
ALTER TABLE "Transcript" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP;

-- Add indexes for performance
CREATE UNIQUE INDEX IF NOT EXISTS "Transcript_externalId_key" ON "Transcript"("externalId");
CREATE INDEX IF NOT EXISTS "Transcript_status_idx" ON "Transcript"("status");
