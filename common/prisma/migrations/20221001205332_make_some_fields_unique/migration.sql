/*
  Warnings:

  - A unique constraint covering the columns `[publicId]` on the table `Sessions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Sessions_publicId_key" ON "Sessions"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");
