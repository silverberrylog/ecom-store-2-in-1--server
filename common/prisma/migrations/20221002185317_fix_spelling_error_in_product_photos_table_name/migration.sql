/*
  Warnings:

  - You are about to drop the `ProductPhotots` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProductPhotots" DROP CONSTRAINT "ProductPhotots_productId_fkey";

-- DropTable
DROP TABLE "ProductPhotots";

-- CreateTable
CREATE TABLE "ProductPhotos" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "ProductPhotos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductPhotos" ADD CONSTRAINT "ProductPhotos_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
