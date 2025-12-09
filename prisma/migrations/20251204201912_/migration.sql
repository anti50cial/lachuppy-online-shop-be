/*
  Warnings:

  - You are about to drop the column `generatedById` on the `AccessCode` table. All the data in the column will be lost.
  - Added the required column `generatorId` to the `AccessCode` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."AccessCode" DROP CONSTRAINT "AccessCode_generatedById_fkey";

-- AlterTable
ALTER TABLE "AccessCode" DROP COLUMN "generatedById",
ADD COLUMN     "generatorId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "AccessCode" ADD CONSTRAINT "AccessCode_generatorId_fkey" FOREIGN KEY ("generatorId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
