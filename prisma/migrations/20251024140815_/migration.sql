/*
  Warnings:

  - You are about to drop the column `imgUrls` on the `Dish` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."DishImage" DROP CONSTRAINT "DishImage_id_fkey";

-- DropIndex
DROP INDEX "public"."Dish_imgUrls_key";

-- AlterTable
ALTER TABLE "Dish" DROP COLUMN "imgUrls";

-- AddForeignKey
ALTER TABLE "DishImage" ADD CONSTRAINT "DishImage_id_fkey" FOREIGN KEY ("id") REFERENCES "Dish"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
