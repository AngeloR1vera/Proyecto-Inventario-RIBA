-- AlterTable
ALTER TABLE "producto" ADD COLUMN     "precio" DECIMAL(12,2) NOT NULL DEFAULT 0;

ALTER TABLE "producto" ADD CONSTRAINT precio_no_negativo CHECK ("precio" >= 0);