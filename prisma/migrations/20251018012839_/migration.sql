/*
  Warnings:

  - You are about to drop the column `label` on the `Dish` table. All the data in the column will be lost.
  - Added the required column `name` to the `Dish` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Dish" DROP COLUMN "label",
ADD COLUMN     "name" TEXT NOT NULL;
