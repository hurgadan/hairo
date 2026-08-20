import { ConfigService } from "@nestjs/config";

import { AppConfig } from "../../_common/types";
import { Locale } from "../../_contracts/users/enums/locale.enum";
import { VERIFICATION_CODE_SUBJECT } from "../constants";
import { createTransport } from "../transports/create-transport";

import { MailService } from "./mail.service";

jest.mock("../transports/create-transport");

describe("MailService", () => {
  const sendMail = jest.fn();
  const mockedCreateTransport = jest.mocked(createTransport);

  beforeEach(() => {
    sendMail.mockReset().mockResolvedValue(undefined);
    mockedCreateTransport.mockReset();
    mockedCreateTransport.mockReturnValue({ sendMail } as unknown as ReturnType<
      typeof createTransport
    >);
  });

  const buildService = (): MailService =>
    new MailService({} as ConfigService<AppConfig, true>);

  it("renders the code and the expiry into both template versions", async () => {
    const service = buildService();

    await service.sendVerificationCode({
      to: "user@example.com",
      code: "482913",
      expiresInMinutes: 10,
    });

    expect(sendMail).toHaveBeenCalledTimes(1);
    const sent = sendMail.mock.calls[0][0];

    expect(sent.to).toBe("user@example.com");
    expect(sent.subject).toBe(VERIFICATION_CODE_SUBJECT[Locale.Ru]);
    expect(sent.html).toContain("482913");
    expect(sent.html).toContain("10");
    expect(sent.text).toContain("482913");
    expect(sent.text).toContain("10");
    // текстовая версия — без разметки
    expect(sent.text).not.toContain("<");
  });

  it("sends the letter in the requested language", async () => {
    const service = buildService();

    await service.sendVerificationCode({
      to: "hans@example.com",
      code: "482913",
      expiresInMinutes: 10,
      locale: Locale.De,
    });

    const sent = sendMail.mock.calls[0][0];

    expect(sent.subject).toBe(VERIFICATION_CODE_SUBJECT[Locale.De]);
    expect(sent.html).toContain("Ihr Anmeldecode");
    expect(sent.html).toContain('lang="de"');
    expect(sent.text).toContain("Ihr Anmeldecode");
  });

  it("falls back to Russian when no language is given", async () => {
    const service = buildService();

    await service.sendVerificationCode({
      to: "user@example.com",
      code: "482913",
      expiresInMinutes: 10,
    });

    const sent = sendMail.mock.calls[0][0];

    expect(sent.subject).toBe(VERIFICATION_CODE_SUBJECT[Locale.Ru]);
    expect(sent.html).toContain("Код для входа");
  });

  it("builds the transport once, not per message", async () => {
    const service = buildService();

    await service.sendVerificationCode({
      to: "a@example.com",
      code: "111111",
      expiresInMinutes: 10,
    });
    await service.sendVerificationCode({
      to: "b@example.com",
      code: "222222",
      expiresInMinutes: 10,
    });

    expect(mockedCreateTransport).toHaveBeenCalledTimes(1);
    expect(sendMail).toHaveBeenCalledTimes(2);
  });

  it("propagates transport failures to the caller", async () => {
    sendMail.mockRejectedValue(new Error("ECONNREFUSED"));
    const service = buildService();

    await expect(
      service.sendVerificationCode({
        to: "user@example.com",
        code: "482913",
        expiresInMinutes: 10,
      }),
    ).rejects.toThrow("ECONNREFUSED");
  });
});
