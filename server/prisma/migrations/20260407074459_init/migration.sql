-- CreateEnum
CREATE TYPE "Category" AS ENUM ('LAPTOP', 'MONITOR', 'SERVER', 'PHONE', 'PRINTER', 'NETWORKING', 'PERIPHERAL');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('IN_USE', 'AVAILABLE', 'UNDER_REPAIR', 'RETIRED');

-- CreateEnum
CREATE TYPE "DepreciationMethod" AS ENUM ('STRAIGHT_LINE', 'DOUBLE_DECLINING', 'UNITS_OF_PRODUCTION');

-- CreateTable
CREATE TABLE "Asset" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "assetTag" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL,
    "purchasePrice" DOUBLE PRECISION NOT NULL,
    "salvageValue" DOUBLE PRECISION NOT NULL,
    "usefulLifeYears" INTEGER NOT NULL,
    "depreciationMethod" "DepreciationMethod" NOT NULL,
    "totalUnits" INTEGER,
    "unitsUsed" INTEGER,
    "assignedEmployee" TEXT,
    "status" "AssetStatus" NOT NULL DEFAULT 'AVAILABLE',
    "location" TEXT,
    "warrantyExpiry" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "assetId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "employeeName" TEXT,
    "details" TEXT,
    "performedBy" TEXT NOT NULL DEFAULT 'System',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Asset_assetTag_key" ON "Asset"("assetTag");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_serialNumber_key" ON "Asset"("serialNumber");

-- CreateIndex
CREATE INDEX "Asset_status_idx" ON "Asset"("status");

-- CreateIndex
CREATE INDEX "Asset_category_idx" ON "Asset"("category");

-- CreateIndex
CREATE INDEX "Asset_assignedEmployee_idx" ON "Asset"("assignedEmployee");

-- CreateIndex
CREATE INDEX "AuditLog_assetId_idx" ON "AuditLog"("assetId");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
