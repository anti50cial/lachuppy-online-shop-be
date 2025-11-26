/*
  Warnings:

  - A unique constraint covering the columns `[txreference]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Order_txreference_key" ON "Order"("txreference");
