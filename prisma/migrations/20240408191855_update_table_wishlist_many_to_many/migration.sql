-- DropForeignKey
ALTER TABLE "whislists" DROP CONSTRAINT "whislists_product_id_fkey";

-- CreateTable
CREATE TABLE "_WishlistToProduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_WishlistToProduct_AB_unique" ON "_WishlistToProduct"("A", "B");

-- CreateIndex
CREATE INDEX "_WishlistToProduct_B_index" ON "_WishlistToProduct"("B");

-- AddForeignKey
ALTER TABLE "_WishlistToProduct" ADD CONSTRAINT "_WishlistToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WishlistToProduct" ADD CONSTRAINT "_WishlistToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "whislists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
