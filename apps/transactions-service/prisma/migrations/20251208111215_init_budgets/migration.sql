-- CreateTable
CREATE TABLE "budgets" (
    "id" TEXT NOT NULL,
    "label" VARCHAR(30) NOT NULL,
    "color" VARCHAR(7),

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);
