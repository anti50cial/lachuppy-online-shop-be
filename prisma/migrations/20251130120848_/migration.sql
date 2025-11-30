/*
  Warnings:

  - You are about to drop the column `paid` on the `Order` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'NOTYETPAID';

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "paid";
