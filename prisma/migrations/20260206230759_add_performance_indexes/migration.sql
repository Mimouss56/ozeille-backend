-- CreateIndex
CREATE INDEX "categories_type_budget_id_idx" ON "categories"("type", "budget_id");

-- CreateIndex
CREATE INDEX "categories_user_id_type_idx" ON "categories"("user_id", "type");

-- CreateIndex
CREATE INDEX "transactions_due_at_user_id_idx" ON "transactions"("due_at", "user_id");

-- CreateIndex
CREATE INDEX "transactions_category_id_due_at_idx" ON "transactions"("category_id", "due_at");
