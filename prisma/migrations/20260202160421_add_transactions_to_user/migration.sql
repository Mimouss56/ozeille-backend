/*
  Warnings:

  - Added the required column `userId` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "user_id" TEXT;

update "transactions" set user_id = (select user_id from categories where categories.id = transactions.category_id limit 1);
ALTER TABLE "transactions" ALTER COLUMN "user_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
