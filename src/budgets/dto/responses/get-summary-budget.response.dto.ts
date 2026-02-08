import { ApiProperty } from "@nestjs/swagger";

import { SummaryCategoryResponseDto } from "../../../categories/dto/get-summary-categories-response.dto";
import { SummaryBalanceResponseDto } from "./balance-budget.response.dto";
import { SummaryUpComingBillsResponseDto } from "./up-coming-budget.response.dto";

export class MonthlySummaryResponseDto {
  @ApiProperty({
    description: "Month in YYYY-MM format",
    example: "2026-02",
  })
  month: string;

  @ApiProperty({
    description: "Total income for the month",
    example: 5000.75,
  })
  totalIncome: number;

  @ApiProperty({
    description: "Total expenses for the month",
    example: 3200.25,
  })
  totalExpenses: number;
}

export class GetSummaryBudgetResponseDto {
  @ApiProperty({
    description: "List of income transactions",
    type: [SummaryCategoryResponseDto],
    isArray: true,
    example: [
      {
        id: "550e8400-e29b-41d4-a716-446655440000",
        label: "Salary",
        color: "#FF5733",
        amount: 1500.5,
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440001",
        label: "Freelance",
        color: "#33FF57",
        amount: 800,
      },
    ],
  })
  incomes: SummaryCategoryResponseDto[];

  @ApiProperty({
    description: "List of upcoming bills/expenses",
    type: [SummaryUpComingBillsResponseDto],
    isArray: true,
    example: [
      {
        id: "550e8400-e29b-41d4-a716-446655440002",
        label: "Rent",
        color: "#FF3333",
        amount: -1200,
        budgetName: "Monthly Budget",
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440003",
        label: "Utilities",
        color: "#3333FF",
        amount: -300,
        budgetName: "Monthly Budget",
      },
    ],
  })
  upCommingBills: SummaryUpComingBillsResponseDto[];

  @ApiProperty({
    description: "Summary balance",
    type: SummaryBalanceResponseDto,
    example: {
      totalIncome: 2300.5,
      totalExpenses: 1500,
    },
  })
  balance: SummaryBalanceResponseDto;

  @ApiProperty({
    description: "Monthly summaries",
    type: [MonthlySummaryResponseDto],
    isArray: true,
    example: [
      {
        month: "2026-01",
        totalIncome: 5000.75,
        totalExpenses: 3200.25,
      },
      {
        month: "2026-02",
        totalIncome: 4500,
        totalExpenses: 2800,
      },
    ],
  })
  monthlySummaries: MonthlySummaryResponseDto[];
}
