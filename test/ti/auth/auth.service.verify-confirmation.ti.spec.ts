import type { Redis } from "ioredis";
import { MailerService } from "src/mailer/services/mailer.service";
import { UsersService } from "src/users/services/users.service";

import { AuthRepository } from "../../../src/auth/repository/auth.repository";
import { AuthService } from "../../../src/auth/services/auth.service";
import { PrismaService } from "../../../src/prisma/prisma.service";

interface RedisMock {
  get: jest.Mock<Promise<string | null>, [string]>;
  del: jest.Mock<Promise<number>, [string]>;
}

describe("AuthService - verifyConfirmation (TI)", () => {
  let mockRedis: RedisMock;
  let mockPrisma: { user: { update: jest.Mock } };
  let repository: AuthRepository;
  let service: AuthService;

  beforeEach(() => {
    mockRedis = { get: jest.fn(), del: jest.fn() };
    mockPrisma = { user: { update: jest.fn() } };
    repository = new AuthRepository(mockRedis as unknown as Redis, mockPrisma as unknown as PrismaService);
    const mockUsersService = {} as UsersService;
    const mockMailerService = {} as MailerService;
    service = new AuthService(repository, mockUsersService, mockMailerService);
  });

  it("retourne true quand le token existe et la mise à jour réussit", async () => {
    mockRedis.get.mockResolvedValue("user@example.com");
    mockPrisma.user.update.mockResolvedValue({ email: "user@example.com", confirmedAt: new Date() });
    mockRedis.del.mockResolvedValue(1);

    const result = await service.verifyConfirmation("token123");

    expect(result).toBe(true);
    expect(mockRedis.get).toHaveBeenCalledWith("confirm-email-token:token123");
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { email: "user@example.com" },
      data: expect.any(Object),
    });
    expect(mockRedis.del).toHaveBeenCalledWith("confirm-email-token:token123");
  });

  it("retourne false quand le token est introuvable", async () => {
    mockRedis.get.mockResolvedValue(null);

    const result = await service.verifyConfirmation("missing");

    expect(result).toBe(false);
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
    expect(mockRedis.del).not.toHaveBeenCalled();
  });

  it("retourne false quand la mise à jour Prisma lève une erreur", async () => {
    mockRedis.get.mockResolvedValue("user@example.com");
    mockPrisma.user.update.mockRejectedValue(new Error("DB error"));

    const result = await service.verifyConfirmation("token-error");

    expect(result).toBe(false);
    expect(mockRedis.del).not.toHaveBeenCalled();
  });
});
