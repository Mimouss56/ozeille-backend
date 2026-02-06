import { ApiProperty } from "@nestjs/swagger";

export class SummaryBalanceResponseDto {
  @ApiProperty({
    description: "Total income amount",
    example: 5000.75,
  })
  totalIncome: number;

  @ApiProperty({
    description: "Total expenses amount",
    example: 3200.25,
  })
  totalExpenses: number;
}
