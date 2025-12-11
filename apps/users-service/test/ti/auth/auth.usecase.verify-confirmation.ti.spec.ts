import type { Redis } from "ioredis";

import { AuthUsecaseVerifyConfirmation } from "../../../src/auth/usecases/auth.usecase.verify-confirmation";
import { PrismaService } from "../../../src/prisma/prisma.service";

interface RedisMock {
  get: jest.Mock<Promise<string | null>, [string]>;
  del: jest.Mock<Promise<number>, [string]>;
}

describe("AuthUsecaseVerifyConfirmation TI", () => {
  let mockRedis: RedisMock;
  let mockPrisma: { user: { update: jest.Mock } };
  let usecase: AuthUsecaseVerifyConfirmation;

  beforeEach(() => {
    mockRedis = { get: jest.fn(), del: jest.fn() };
    mockPrisma = { user: { update: jest.fn() } };
    usecase = new AuthUsecaseVerifyConfirmation(mockRedis as unknown as Redis, mockPrisma as unknown as PrismaService);
  });

  it("retourne true quand le token existe et la mise à jour réussit", async () => {
    mockRedis.get.mockResolvedValue("user@example.com");
    mockPrisma.user.update.mockResolvedValue({ email: "user@example.com", confirmedAt: new Date() });
    mockRedis.del.mockResolvedValue(1);

    const result = await usecase.verify("token123");

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

    const result = await usecase.verify("missing");

    expect(result).toBe(false);
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
    expect(mockRedis.del).not.toHaveBeenCalled();
  });

  it("retourne false quand la mise à jour Prisma lève une erreur", async () => {
    mockRedis.get.mockResolvedValue("user@example.com");
    mockPrisma.user.update.mockRejectedValue(new Error("DB error"));

    const result = await usecase.verify("token-error");

    expect(result).toBe(false);
    expect(mockRedis.del).not.toHaveBeenCalled();
  });
});
