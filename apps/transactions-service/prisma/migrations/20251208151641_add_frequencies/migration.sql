-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "frequency_id" TEXT;

-- CreateTable
CREATE TABLE "frequencies" (
    "id" TEXT NOT NULL,
    "label" VARCHAR NOT NULL,
    "monthlyValue" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "frequencies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "frequencies_monthlyValue_key" ON "frequencies"("monthlyValue");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_frequency_id_fkey" FOREIGN KEY ("frequency_id") REFERENCES "frequencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
