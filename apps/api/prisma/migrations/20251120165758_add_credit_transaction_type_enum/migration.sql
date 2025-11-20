-- CreateEnum: CreditTransactionType
CREATE TYPE "CreditTransactionType" AS ENUM (
    'DEDUCTION_CLIPS',
    'DEDUCTION_REFRAME',
    'DEDUCTION_CAPTIONS',
    'ADDITION_PURCHASE',
    'ADDITION_RENEWAL',
    'ADDITION_TRIAL',
    'ADDITION_REFUND',
    'ADDITION_MANUAL'
);

-- AlterTable: Change type column from TEXT to enum
ALTER TABLE "CreditTransaction" ALTER COLUMN "type" TYPE "CreditTransactionType" USING "type"::"CreditTransactionType";
