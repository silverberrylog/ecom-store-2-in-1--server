-- CreateTable
CREATE TABLE "Products" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "taxPercentage" INTEGER NOT NULL,
    "inStock" BOOLEAN NOT NULL,
    "isActive" BOOLEAN NOT NULL,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("id")
);
