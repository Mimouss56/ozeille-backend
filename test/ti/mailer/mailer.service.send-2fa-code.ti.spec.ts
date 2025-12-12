import { Test, TestingModule } from "@nestjs/testing";
import { MailerRepository } from "src/mailer/repository/mailer.repository";
import { MailerService } from "src/mailer/services/mailer.service";
import { RedisService } from "src/redis/redis.module";

describe("MailerService - send2FACode (TI)", () => {
  let service: MailerService;
  let sendMailSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailerService,
        {
          provide: MailerRepository,
          useValue: {
            generateAndStoreConfirmToken: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: {
            setWithPrefix: jest.fn(),
            getWithPrefix: jest.fn(),
            delWithPrefix: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MailerService>(MailerService);
    sendMailSpy = jest.spyOn(service, "sendMail").mockResolvedValue();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("send2FACode", () => {
    it("devrait envoyer un email avec le code 2FA", async () => {
      const email = "test@example.com";
      const code = "12345678";

      await service.send2FACode(email, code);

      expect(sendMailSpy).toHaveBeenCalledTimes(1);
      const [calledEmail, calledSubject, calledHtml] = sendMailSpy.mock.calls[0];

      expect(calledEmail).toBe(email);
      expect(calledSubject).toBe("Code de vérification 2FA");
      expect(calledHtml).toContain(code);
      expect(calledHtml).toContain("Code de vérification");
      expect(calledHtml).toContain("10 minutes");
    });

    it("devrait inclure le code dans le HTML de l'email", async () => {
      const email = "user@test.com";
      const code = "87654321";

      await service.send2FACode(email, code);

      const calledHtml = sendMailSpy.mock.calls[0][2];
      expect(calledHtml).toMatch(new RegExp(code));
    });
  });
});
