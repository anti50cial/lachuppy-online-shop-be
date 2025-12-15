/*
  Warnings:

  - You are about to drop the column `signupCodeId` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the `SignupCode` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[keyCardId]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."Admin" DROP CONSTRAINT "Admin_signupCodeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SignupCode" DROP CONSTRAINT "SignupCode_generatorId_fkey";

-- DropIndex
DROP INDEX "public"."Admin_signupCodeId_key";

-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "signupCodeId",
ADD COLUMN     "keyCardId" TEXT;

-- DropTable
DROP TABLE "public"."SignupCode";

-- CreateTable
CREATE TABLE "KeyCard" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "valid" BOOLEAN NOT NULL DEFAULT true,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "permissions" TEXT[],
    "generatorId" TEXT NOT NULL,

    CONSTRAINT "KeyCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KeyCard_code_key" ON "KeyCard"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_keyCardId_key" ON "Admin"("keyCardId");

-- AddForeignKey
ALTER TABLE "KeyCard" ADD CONSTRAINT "KeyCard_generatorId_fkey" FOREIGN KEY ("generatorId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_keyCardId_fkey" FOREIGN KEY ("keyCardId") REFERENCES "KeyCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;
