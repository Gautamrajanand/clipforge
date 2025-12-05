-- Restore test credits for development testing
-- Run this after database reset to get credits back

-- Update all organizations to have credits
UPDATE "Organization" 
SET 
  credits = 150,
  "creditsResetDate" = NOW() + INTERVAL '30 days',
  "creditsUsedThisMonth" = 0,
  tier = 'STARTER'
WHERE tier = 'FREE';

-- If no organizations exist, this won't do anything
-- You'll need to sign up first, then run this script

-- To run this:
-- docker exec -i clipforge-postgres psql -U clipforge -d clipforge_dev < restore-test-credits.sql
