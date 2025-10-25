/*
  Warnings:

  - You are about to drop the column `imgUrl` on the `Dish` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[imgUrls]` on the table `Dish` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `imgUrls` to the `Dish` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Dish" DROP COLUMN "imgUrl",
ADD COLUMN     "imgUrls" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "DishImage" (
    "id" TEXT NOT NULL,
    "location" TEXT NOT NULL,

    CONSTRAINT "DishImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DishImage_location_key" ON "DishImage"("location");

-- CreateIndex
CREATE UNIQUE INDEX "Dish_imgUrls_key" ON "Dish"("imgUrls");

-- AddForeignKey
ALTER TABLE "DishImage" ADD CONSTRAINT "DishImage_id_fkey" FOREIGN KEY ("id") REFERENCES "Dish"("imgUrls") ON DELETE RESTRICT ON UPDATE CASCADE;
