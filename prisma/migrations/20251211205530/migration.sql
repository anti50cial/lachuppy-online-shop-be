/*
  Warnings:

  - You are about to drop the column `valid` on the `KeyCard` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "KeyCard" DROP COLUMN "valid",
ADD COLUMN     "isUsed" BOOLEAN NOT NULL DEFAULT true;
