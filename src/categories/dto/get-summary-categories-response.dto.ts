import { ApiProperty } from "@nestjs/swagger";

export class SummaryCategoryResponseDto {
  @ApiProperty({
    description: "Transaction ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  id: string;

  @ApiProperty({
    description: "Category label",
    example: "Salary",
  })
  label: string;

  @ApiProperty({
    description: "Category color",
    example: "#FF5733",
    nullable: true,
  })
  color: string | null;

  @ApiProperty({
    description: "Transaction amount",
    example: 1500.5,
  })
  amount: number;
}
