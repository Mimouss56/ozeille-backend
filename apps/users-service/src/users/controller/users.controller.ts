import { Controller, Get, Param, ParseUUIDPipe } from "@nestjs/common";
import { ApiNotFoundResponse, ApiOkResponse } from "@nestjs/swagger";
import { ErrorResponse } from "src/common/dto/base-error.dto";

import { UserEntity } from "../entities/user.entity";
import { UsersService } from "../services/users.service";

@Controller("api/users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(":id")
  @ApiOkResponse({
    description: "User found",
    type: UserEntity,
  })
  @ApiNotFoundResponse({
    description: "The user with the given ID was not found.",
    type: ErrorResponse,
  })
  async findOne(@Param("id", ParseUUIDPipe) id: string): Promise<UserEntity> {
    return this.usersService.findById(id);
  }
}
