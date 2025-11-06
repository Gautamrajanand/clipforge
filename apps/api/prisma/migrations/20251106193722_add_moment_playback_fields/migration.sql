-- Add in-page playback fields to Moment table (ADDITIVE ONLY)
-- These fields enable immediate clip viewing without export

-- Proxy video URL (lightweight 720p preview)
ALTER TABLE "Moment" ADD COLUMN IF NOT EXISTS "proxyUrl" VARCHAR;

-- Thumbnail URL (first frame)
ALTER TABLE "Moment" ADD COLUMN IF NOT EXISTS "thumbnailUrl" VARCHAR;
