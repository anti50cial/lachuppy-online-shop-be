/*
  Warnings:

  - You are about to drop the column `accessCodeId` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the `AccessCode` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[signupCodeId]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."AccessCode" DROP CONSTRAINT "AccessCode_generatorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Admin" DROP CONSTRAINT "Admin_accessCodeId_fkey";

-- DropIndex
DROP INDEX "public"."Admin_accessCodeId_key";

-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "accessCodeId",
ADD COLUMN     "signupCodeId" TEXT;

-- DropTable
DROP TABLE "public"."AccessCode";

-- CreateTable
CREATE TABLE "SignupCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "valid" BOOLEAN NOT NULL DEFAULT true,
    "role" "Role" NOT NULL DEFAULT 'Admin',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generatorId" TEXT NOT NULL,

    CONSTRAINT "SignupCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SignupCode_code_key" ON "SignupCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_signupCodeId_key" ON "Admin"("signupCodeId");

-- AddForeignKey
ALTER TABLE "SignupCode" ADD CONSTRAINT "SignupCode_generatorId_fkey" FOREIGN KEY ("generatorId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_signupCodeId_fkey" FOREIGN KEY ("signupCodeId") REFERENCES "SignupCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
