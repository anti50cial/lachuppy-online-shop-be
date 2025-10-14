/*
  Warnings:

  - You are about to drop the column `createdById` on the `Admin` table. All the data in the column will be lost.
  - Added the required column `generatedById` to the `AccessCode` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Admin" DROP CONSTRAINT "Admin_createdById_fkey";

-- AlterTable
ALTER TABLE "AccessCode" ADD COLUMN     "generatedById" TEXT NOT NULL,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'Admin',
ALTER COLUMN "valid" SET DEFAULT true;

-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "createdById";

-- AddForeignKey
ALTER TABLE "AccessCode" ADD CONSTRAINT "AccessCode_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
