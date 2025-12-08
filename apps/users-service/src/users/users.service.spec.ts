import { Test, TestingModule } from "@nestjs/testing";

import { UsersUsecaseRegister } from "./usecases/users.usecase.register";

describe("UsersService", () => {
  let service: UsersUsecaseRegister;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersUsecaseRegister],
    }).compile();

    service = module.get<UsersUsecaseRegister>(UsersUsecaseRegister);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
