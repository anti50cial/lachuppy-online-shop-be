/*
  Warnings:

  - You are about to drop the column `generated` on the `AccessCode` table. All the data in the column will be lost.
  - You are about to drop the column `joined` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `timeOrdered` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AccessCode" DROP COLUMN "generated",
ADD COLUMN     "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "joined",
ADD COLUMN     "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "timeOrdered",
ADD COLUMN     "orderedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
