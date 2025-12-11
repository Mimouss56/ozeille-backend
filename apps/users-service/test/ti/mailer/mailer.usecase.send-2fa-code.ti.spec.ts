import { Test, TestingModule } from "@nestjs/testing";
import { MailerUsecaseSendMail } from "src/mailer/usecase/mailer.usecase.send-mail";

import { MailerUsecaseSend2FACode } from "../../../src/mailer/usecase/mailer.usecase.send-2fa-code";

describe("MailerUsecaseSend2FACode TI", () => {
  let usecase: MailerUsecaseSend2FACode;
  let mockMailerSendMail: jest.Mocked<MailerUsecaseSendMail>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailerUsecaseSend2FACode,
        {
          provide: MailerUsecaseSendMail,
          useValue: {
            sendMail: jest.fn(),
          },
        },
      ],
    }).compile();

    usecase = module.get<MailerUsecaseSend2FACode>(MailerUsecaseSend2FACode);
    mockMailerSendMail = module.get(MailerUsecaseSendMail);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("send2FACode", () => {
    it("devrait envoyer un email avec le code 2FA", async () => {
      const email = "test@example.com";
      const code = "123456";

      await usecase.send2FACode(email, code);

      expect(mockMailerSendMail.sendMail).toHaveBeenCalledTimes(1);
      const [calledEmail, calledSubject, calledHtml] = mockMailerSendMail.sendMail.mock.calls[0];

      expect(calledEmail).toBe(email);
      expect(calledSubject).toBe("Code de vérification 2FA");
      expect(calledHtml).toContain(code);
      expect(calledHtml).toContain("Code de vérification");
      expect(calledHtml).toContain("10 minutes");
    });

    it("devrait inclure le code dans le HTML de l'email", async () => {
      const email = "user@test.com";
      const code = "654321";

      await usecase.send2FACode(email, code);

      const calledHtml = mockMailerSendMail.sendMail.mock.calls[0][2];
      expect(calledHtml).toMatch(new RegExp(code));
    });
  });
});
