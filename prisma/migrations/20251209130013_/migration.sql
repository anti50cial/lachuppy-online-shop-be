/*
  Warnings:

  - You are about to drop the column `role` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `SignupCode` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "role";

-- AlterTable
ALTER TABLE "SignupCode" DROP COLUMN "role";

-- DropEnum
DROP TYPE "public"."Role";
