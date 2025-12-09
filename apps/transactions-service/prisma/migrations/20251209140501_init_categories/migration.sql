-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "budget_id" TEXT NOT NULL,
    "label" VARCHAR(30) NOT NULL,
    "color" VARCHAR(7),
    "user_id" TEXT,
    "limit_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_label_user_id_budget_id_key" ON "categories"("label", "user_id", "budget_id");

-- CreateIndex
CREATE UNIQUE INDEX "categories_label_user_id_key" ON "categories"("label", "user_id");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_budget_id_fkey" FOREIGN KEY ("budget_id") REFERENCES "budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
