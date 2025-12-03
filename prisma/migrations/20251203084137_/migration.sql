/*
  Warnings:

  - You are about to drop the column `accessCodeId` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the `AccessCode` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."AccessCode" DROP CONSTRAINT "AccessCode_generatedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."Admin" DROP CONSTRAINT "Admin_accessCodeId_fkey";

-- DropIndex
DROP INDEX "public"."Admin_accessCodeId_key";

-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "accessCodeId",
ADD COLUMN     "createdById" TEXT;

-- DropTable
DROP TABLE "public"."AccessCode";

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
