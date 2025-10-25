/*
  Warnings:

  - Added the required column `dishId` to the `DishImage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."DishImage" DROP CONSTRAINT "DishImage_id_fkey";

-- AlterTable
ALTER TABLE "DishImage" ADD COLUMN     "dishId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "DishImage" ADD CONSTRAINT "DishImage_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "Dish"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
