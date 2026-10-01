/*
  Warnings:

  - A unique constraint covering the columns `[prefijo]` on the table `categoria` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `prefijo` to the `categoria` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "categoria" ADD COLUMN     "prefijo" TEXT NOT NULL,
ADD COLUMN     "ultimoNumero" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "categoria_prefijo_key" ON "categoria"("prefijo");
