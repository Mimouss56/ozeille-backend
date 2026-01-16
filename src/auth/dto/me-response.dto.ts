import { UserEntity } from "src/users/entities/user.entity";

export class MeResponseDto {
  message: string;
  userId: string;
  method: string;
  me: UserEntity;
}
