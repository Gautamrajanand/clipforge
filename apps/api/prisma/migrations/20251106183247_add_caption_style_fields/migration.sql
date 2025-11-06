-- Add caption styling fields to Export table (ADDITIVE ONLY)
-- These fields store caption preset selection and enable/disable state

-- Caption style preset ID (karaoke, deep_diver, pod_p, etc.)
ALTER TABLE "Export" ADD COLUMN IF NOT EXISTS "captionStyle" VARCHAR DEFAULT 'karaoke';

-- Enable/disable captions
ALTER TABLE "Export" ADD COLUMN IF NOT EXISTS "captionsEnabled" BOOLEAN DEFAULT true;
