-- DropForeignKey
ALTER TABLE "public"."DishImage" DROP CONSTRAINT "DishImage_dishId_fkey";

-- AddForeignKey
ALTER TABLE "DishImage" ADD CONSTRAINT "DishImage_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "Dish"("id") ON DELETE CASCADE ON UPDATE CASCADE;
