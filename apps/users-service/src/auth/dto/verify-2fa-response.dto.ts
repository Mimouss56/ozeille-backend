import { ApiProperty } from "@nestjs/swagger";

export class Verify2FAResponseDto {
  @ApiProperty({
    description: "ID de l'utilisateur authentifié",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  userId: string;

  @ApiProperty({
    description: "Email de l'utilisateur",
    example: "user@example.com",
  })
  email: string;

  @ApiProperty({
    description: "Message de succès",
    example: "Authentification réussie",
  })
  message: string;
}
