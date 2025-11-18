/*
  Warnings:

  - Made the column `description` on table `Dish` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Dish" ALTER COLUMN "description" SET NOT NULL;
