/*
  Warnings:

  - You are about to drop the column `address` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `addresses` table. All the data in the column will be lost.
  - Added the required column `country` to the `addresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `province` to the `addresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `street` to the `addresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subdistrict` to the `addresses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "addresses" DROP COLUMN "address",
DROP COLUMN "state",
ADD COLUMN     "country" VARCHAR(100) NOT NULL,
ADD COLUMN     "province" VARCHAR(100) NOT NULL,
ADD COLUMN     "street" TEXT NOT NULL,
ADD COLUMN     "subdistrict" VARCHAR(100) NOT NULL;
