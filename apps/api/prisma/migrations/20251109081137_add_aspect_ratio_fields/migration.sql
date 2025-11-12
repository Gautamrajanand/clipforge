/*
  Warnings:

  - You are about to drop the column `reason` on the `Moment` table. All the data in the column will be lost.
  - You are about to drop the column `targetPlatform` on the `Moment` table. All the data in the column will be lost.
  - Made the column `captionsEnabled` on table `Export` required. This step will fail if there are existing NULL values in that column.
  - Made the column `title` on table `Moment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `Transcript` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Moment_projectId_idx";

-- AlterTable
ALTER TABLE "Export" ADD COLUMN     "aspectRatio" TEXT,
ADD COLUMN     "burnCaptions" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "cropMode" TEXT DEFAULT 'crop',
ADD COLUMN     "cropPosition" JSONB,
ALTER COLUMN "processingStatus" SET DATA TYPE TEXT,
ALTER COLUMN "processedUrl" SET DATA TYPE TEXT,
ALTER COLUMN "processingStartedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "processingCompletedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "captionStyle" SET DATA TYPE TEXT,
ALTER COLUMN "captionsEnabled" SET NOT NULL;

-- AlterTable
ALTER TABLE "Moment" DROP COLUMN "reason",
DROP COLUMN "targetPlatform",
ALTER COLUMN "features" DROP NOT NULL,
ALTER COLUMN "title" SET NOT NULL,
ALTER COLUMN "aspectRatio" SET DEFAULT '9:16',
ALTER COLUMN "proxyUrl" SET DATA TYPE TEXT,
ALTER COLUMN "thumbnailUrl" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Transcript" ALTER COLUMN "externalId" SET DATA TYPE TEXT,
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "status" SET DATA TYPE TEXT,
ALTER COLUMN "completedAt" SET DATA TYPE TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Transcript_externalId_idx" ON "Transcript"("externalId");
