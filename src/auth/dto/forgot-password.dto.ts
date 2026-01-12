import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

export class ForgotPasswordDto {
  @ApiProperty({
    example: "user@example.com",
    description: "Adresse email de l'utilisateur",
  })
  @IsEmail({}, { message: "L'email doit être valide" })
  email: string;
}
