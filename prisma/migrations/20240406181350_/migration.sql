/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `billboards` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `brands` table. All the data in the column will be lost.
  - You are about to drop the column `isArchived` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `isFeatured` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `shopping_cart` table. All the data in the column will be lost.
  - You are about to drop the column `passwordResetAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `passwordResetToken` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `verificationCode` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `stok` on the `variants` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[verification_code]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `image_url` to the `brands` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_id` to the `shopping_cart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variant_id` to the `shopping_cart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image_url` to the `variants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stock` to the `variants` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "shopping_cart" DROP CONSTRAINT "shopping_cart_productId_fkey";

-- DropIndex
DROP INDEX "shopping_cart_productId_idx";

-- DropIndex
DROP INDEX "users_verificationCode_key";

-- AlterTable
ALTER TABLE "billboards" DROP COLUMN "imageUrl",
ADD COLUMN     "image_url" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "brands" DROP COLUMN "imageUrl",
ADD COLUMN     "image_url" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "isArchived",
DROP COLUMN "isFeatured",
ADD COLUMN     "is_archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_variant" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "status_type" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "shopping_cart" DROP COLUMN "productId",
ADD COLUMN     "product_id" TEXT NOT NULL,
ADD COLUMN     "variant_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "passwordResetAt",
DROP COLUMN "passwordResetToken",
DROP COLUMN "verificationCode",
ADD COLUMN     "password_reset_At" TIMESTAMP(3),
ADD COLUMN     "password_reset_token" TEXT,
ADD COLUMN     "verification_code" TEXT;

-- AlterTable
ALTER TABLE "variants" DROP COLUMN "stok",
ADD COLUMN     "image_url" TEXT NOT NULL,
ADD COLUMN     "stock" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "shopping_cart_product_id_idx" ON "shopping_cart"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_verification_code_key" ON "users"("verification_code");

-- AddForeignKey
ALTER TABLE "shopping_cart" ADD CONSTRAINT "shopping_cart_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_cart" ADD CONSTRAINT "shopping_cart_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
