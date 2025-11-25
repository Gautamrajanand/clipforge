-- Add 200 credits to test 2-hour video import
-- Run this in Prisma Studio or psql

-- Find your organization ID first
SELECT id, name, credits FROM "Organization" WHERE name LIKE '%Workspace%';

-- Add 200 credits (replace 'YOUR_ORG_ID' with actual ID from above)
UPDATE "Organization" 
SET credits = credits + 200 
WHERE id = 'cmi8pibvl0000nsjeycto14xd';

-- Verify
SELECT id, name, credits FROM "Organization" WHERE id = 'cmi8pibvl0000nsjeycto14xd';
