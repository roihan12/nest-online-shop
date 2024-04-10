/*
  Warnings:

  - Added the required column `variant_id` to the `transactions_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variant_name` to the `transactions_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "transactions_items" ADD COLUMN     "variant_id" VARCHAR(110) NOT NULL,
ADD COLUMN     "variant_name" VARCHAR(255) NOT NULL;

-- AddForeignKey
ALTER TABLE "transactions_items" ADD CONSTRAINT "transactions_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
