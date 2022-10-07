-- CreateTable
CREATE TABLE "ProductPhotots" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "ProductPhotots_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductPhotots" ADD CONSTRAINT "ProductPhotots_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
