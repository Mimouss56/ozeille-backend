-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('EXPENSE', 'INCOME');

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "type" "TransactionType" NOT NULL DEFAULT 'EXPENSE';
