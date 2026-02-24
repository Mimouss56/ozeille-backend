export const BudgetsDataset = {
  user: {
    email: "budget.e2e@example.com",
    password: "Password123!",
    firstName: "Budget",
    lastName: "Tester",
  },
  existingBudget: {
    label: "Budget E2E",
    color: "#3498db",
  },
  newBudget: {
    label: "Nouveau Budget",
    color: "#00FF00",
  },
  category: {
    label: "Charges Fixes",
    color: "#ef4444",
    limitAmount: 800,
    type: "EXPENSE",
  },
  transactions: [
    {
      label: "Loyer février",
      amount: -650,
      dueAt: new Date("2026-02-10T00:00:00.000Z"),
    },
    {
      label: "Loyer mars",
      amount: -650,
      dueAt: new Date("2026-03-10T00:00:00.000Z"),
    },
  ],
};
