-- Add reason column back to Moment table for ML worker compatibility
ALTER TABLE "Moment" ADD COLUMN "reason" TEXT;
