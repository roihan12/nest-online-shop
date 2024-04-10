-- DropForeignKey
ALTER TABLE "transactions_items" DROP CONSTRAINT "transactions_items_variant_id_fkey";

-- AlterTable
ALTER TABLE "transactions_items" ALTER COLUMN "variant_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "transactions_items" ADD CONSTRAINT "transactions_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
