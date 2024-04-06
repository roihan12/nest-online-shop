/*
  Warnings:

  - Added the required column `imageUrl` to the `brands` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "brands" ADD COLUMN     "imageUrl" TEXT NOT NULL;
