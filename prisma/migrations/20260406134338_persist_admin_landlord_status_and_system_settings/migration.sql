-- CreateEnum
CREATE TYPE "LandlordApprovalStatus" AS ENUM ('ACTIVE', 'PENDING_VERIFICATION', 'REJECTED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "landlordApprovalStatus" "LandlordApprovalStatus";

-- CreateTable
CREATE TABLE "AdminSystemSetting" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "platformCommissionRate" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "autoApproveLandlords" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "supportEmail" TEXT NOT NULL DEFAULT 'support@homemanager.vn',
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminSystemSetting_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AdminSystemSetting" ADD CONSTRAINT "AdminSystemSetting_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
