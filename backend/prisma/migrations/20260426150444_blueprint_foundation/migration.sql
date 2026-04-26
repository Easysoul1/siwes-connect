/*
  Warnings:

  - You are about to alter the column `cgpa` on the `Student` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(3,2)`.
  - A unique constraint covering the columns `[slug]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[matricNumber]` on the table `Student` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('APPLICATION_SUBMITTED', 'APPLICATION_REVIEWED', 'APPLICATION_ACCEPTED', 'APPLICATION_REJECTED', 'PLACEMENT_POSTED', 'ORGANIZATION_APPROVED', 'ORGANIZATION_REJECTED', 'ANNOUNCEMENT', 'DEADLINE_REMINDER', 'PLACEMENT_CONFIRMED');

-- CreateEnum
CREATE TYPE "StudyField" AS ENUM ('COMPUTER_SCIENCE', 'ELECTRICAL_ENGINEERING', 'MECHANICAL_ENGINEERING', 'CIVIL_ENGINEERING', 'CHEMICAL_ENGINEERING', 'ACCOUNTING', 'BUSINESS_ADMINISTRATION', 'MEDICINE', 'PHARMACY', 'AGRICULTURE', 'ARCHITECTURE', 'LAW', 'MASS_COMMUNICATION', 'ECONOMICS', 'MICROBIOLOGY', 'BIOCHEMISTRY', 'STATISTICS', 'MATHEMATICS', 'PHYSICS', 'CHEMISTRY', 'GEOLOGY', 'PETROLEUM_ENGINEERING', 'OTHER');

-- CreateEnum
CREATE TYPE "NigerianState" AS ENUM ('ABIA', 'ADAMAWA', 'AKWA_IBOM', 'ANAMBRA', 'BAUCHI', 'BAYELSA', 'BENUE', 'BORNO', 'CROSS_RIVER', 'DELTA', 'EBONYI', 'EDO', 'EKITI', 'ENUGU', 'FCT', 'GOMBE', 'IMO', 'JIGAWA', 'KADUNA', 'KANO', 'KATSINA', 'KEBBI', 'KOGI', 'KWARA', 'LAGOS', 'NASARAWA', 'NIGER', 'OGUN', 'ONDO', 'OSUN', 'OYO', 'PLATEAU', 'RIVERS', 'SOKOTO', 'TARABA', 'YOBE', 'ZAMFARA');

-- AlterEnum
ALTER TYPE "ApplicationStatus" ADD VALUE 'DRAFT';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PlacementStatus" ADD VALUE 'EXPIRED';
ALTER TYPE "PlacementStatus" ADD VALUE 'FILLED';

-- AlterEnum
ALTER TYPE "VerificationStatus" ADD VALUE 'SUSPENDED';

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "additionalDocs" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "coverLetter" TEXT,
ADD COLUMN     "institutionApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "institutionNote" TEXT,
ADD COLUMN     "interviewDate" TIMESTAMP(3),
ADD COLUMN     "orgNote" TEXT,
ADD COLUMN     "organizationId" TEXT,
ADD COLUMN     "placementStartDate" TIMESTAMP(3),
ADD COLUMN     "resumeUrl" TEXT,
ADD COLUMN     "statusHistory" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "supervisorContact" TEXT,
ADD COLUMN     "supervisorName" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Coordinator" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "department" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "institutionId" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "staffId" TEXT,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "data" JSONB,
ADD COLUMN     "readAt" TIMESTAMP(3),
ADD COLUMN     "type" "NotificationType" NOT NULL DEFAULT 'ANNOUNCEMENT';

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "address" TEXT,
ADD COLUMN     "cacDocumentUrl" TEXT,
ADD COLUMN     "companySize" TEXT,
ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactPersonName" TEXT,
ADD COLUMN     "contactPersonTitle" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "fields" "StudyField"[] DEFAULT ARRAY[]::"StudyField"[],
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "itfDocumentUrl" TEXT,
ADD COLUMN     "itfNumber" TEXT,
ADD COLUMN     "lga" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "rating" DECIMAL(2,1),
ADD COLUMN     "rcNumber" TEXT,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "totalSlotsHosted" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedBy" TEXT,
ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "Placement" ADD COLUMN     "benefits" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "durationWeeks" INTEGER,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "hasStipend" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lga" TEXT,
ADD COLUMN     "minimumCGPA" DECIMAL(3,2),
ADD COLUMN     "minimumLevel" TEXT,
ADD COLUMN     "requiredFields" "StudyField"[] DEFAULT ARRAY[]::"StudyField"[],
ADD COLUMN     "requirements" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "responsibilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "selectionProcess" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "stipendAmount" DECIMAL(10,2),
ADD COLUMN     "stipendCurrency" TEXT NOT NULL DEFAULT 'NGN',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "currentAddress" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "faculty" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "institutionId" TEXT,
ADD COLUMN     "matricNumber" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "preferredDuration" INTEGER,
ADD COLUMN     "profilePhoto" TEXT,
ADD COLUMN     "resumeUrl" TEXT,
ADD COLUMN     "siwesYear" TEXT,
ADD COLUMN     "studyField" "StudyField" NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "cgpa" SET DATA TYPE DECIMAL(3,2);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordReset" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Institution" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "state" "NigerianState" NOT NULL,
    "address" TEXT NOT NULL,
    "website" TEXT,
    "logoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT,
    "createdBy" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "targetAudience" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_token_key" ON "PasswordReset"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Student_matricNumber_key" ON "Student"("matricNumber");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coordinator" ADD CONSTRAINT "Coordinator_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
