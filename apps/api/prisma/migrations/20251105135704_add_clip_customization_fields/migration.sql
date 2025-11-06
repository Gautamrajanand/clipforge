-- AlterTable
ALTER TABLE "Moment" ADD COLUMN     "aspectRatio" TEXT NOT NULL DEFAULT '16:9',
ADD COLUMN     "targetPlatform" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "clipSettings" JSONB;
