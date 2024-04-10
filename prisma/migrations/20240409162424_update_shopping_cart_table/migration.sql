-- DropForeignKey
ALTER TABLE "shopping_cart" DROP CONSTRAINT "shopping_cart_variant_id_fkey";

-- AlterTable
ALTER TABLE "shopping_cart" ALTER COLUMN "variant_id" DROP NOT NULL,
ALTER COLUMN "variant_id" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "shopping_cart" ADD CONSTRAINT "shopping_cart_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
