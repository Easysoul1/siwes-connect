-- AlterTable
ALTER TABLE "LogbookEntry" ADD COLUMN "organizationComment" TEXT;
ALTER TABLE "LogbookEntry" ADD COLUMN "organizationSignature" TEXT;
ALTER TABLE "LogbookEntry" ADD COLUMN "organizationReviewedAt" TIMESTAMP(3);
ALTER TABLE "LogbookEntry" ADD COLUMN "coordinatorComment" TEXT;
ALTER TABLE "LogbookEntry" ADD COLUMN "coordinatorSignature" TEXT;
ALTER TABLE "LogbookEntry" ADD COLUMN "coordinatorReviewedAt" TIMESTAMP(3);
