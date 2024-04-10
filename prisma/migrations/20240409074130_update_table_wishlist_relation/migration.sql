/*
  Warnings:

  - You are about to drop the `_WishlistToProduct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `whislists` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_WishlistToProduct" DROP CONSTRAINT "_WishlistToProduct_A_fkey";

-- DropForeignKey
ALTER TABLE "_WishlistToProduct" DROP CONSTRAINT "_WishlistToProduct_B_fkey";

-- DropForeignKey
ALTER TABLE "whislists" DROP CONSTRAINT "whislists_user_id_fkey";

-- AlterTable
ALTER TABLE "shopping_cart" ALTER COLUMN "variant_id" SET DEFAULT '';

-- DropTable
DROP TABLE "_WishlistToProduct";

-- DropTable
DROP TABLE "whislists";

-- CreateTable
CREATE TABLE "wishlist" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "wishlist_user_id_idx" ON "wishlist"("user_id");

-- CreateIndex
CREATE INDEX "wishlist_product_id_idx" ON "wishlist"("product_id");

-- AddForeignKey
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
