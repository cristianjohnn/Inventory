-- CreateEnum
CREATE TYPE "Department" AS ENUM ('ADMIN_DEPARTMENT', 'CORPORATE_DEPARTMENT', 'CUSTOMER_CARE', 'I_TECH', 'I_WALLET', 'IT_DEPARTMENT', 'IT_SUPPORT', 'JOINT_VENTURES', 'MARKETING', 'REAL_ESTATE', 'SECRETARY', 'EXECUTIVE');

-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "department" "Department";

-- CreateIndex
CREATE INDEX "Asset_department_idx" ON "Asset"("department");
