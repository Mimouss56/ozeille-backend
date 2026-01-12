// Ce fichier de test n'est plus nécessaire car AuthRepository ne gère plus
// directement les codes 2FA. Cette logique est maintenant gérée par RedisService.
// Les tests de 2FA sont maintenant dans auth.service.validate-2fa.ti.spec.ts

describe("AuthRepository - 2FA (TI) - DEPRECATED", () => {
  it("should be removed - logic moved to RedisService", () => {
    expect(true).toBe(true);
  });
});
