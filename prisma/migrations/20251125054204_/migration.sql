/*
  Warnings:

  - Added the required column `txreference` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "txreference" TEXT NOT NULL;
