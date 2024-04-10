/*
  Warnings:

  - Added the required column `transactions_item_id` to the `reviews` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "transactions_status" ADD VALUE 'SHIPPING';
ALTER TYPE "transactions_status" ADD VALUE 'DELIVERED';

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "transactions_item_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_transactions_item_id_fkey" FOREIGN KEY ("transactions_item_id") REFERENCES "transactions_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
