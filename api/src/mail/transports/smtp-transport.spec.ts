import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

import { AppConfig, MailConfig } from "../../_common/types";
import { MailProvider } from "../enums";

import { SmtpTransport } from "./smtp-transport";

jest.mock("nodemailer");

describe("SmtpTransport", () => {
  const sendMail = jest.fn();
  const mockedCreateTransport = jest.mocked(nodemailer.createTransport);

  beforeEach(() => {
    sendMail.mockReset().mockResolvedValue(undefined);
    mockedCreateTransport.mockReset();
    mockedCreateTransport.mockReturnValue({ sendMail } as unknown as ReturnType<
      typeof nodemailer.createTransport
    >);
  });

  const buildConfig = (
    smtp: Partial<MailConfig["smtp"]> = {},
  ): ConfigService<AppConfig, true> =>
    ({
      getOrThrow: jest.fn().mockReturnValue({
        provider: MailProvider.Smtp,
        from: "Hairo <noreply@hairo.local>",
        smtp: {
          host: "localhost",
          port: 1025,
          secure: false,
          user: undefined,
          password: undefined,
          ...smtp,
        },
      } satisfies MailConfig),
    }) as unknown as ConfigService<AppConfig, true>;

  it("claims only the smtp provider", () => {
    expect(SmtpTransport.itIsMe(MailProvider.Smtp)).toBe(true);
    expect(SmtpTransport.itIsMe(MailProvider.Log)).toBe(false);
  });

  it("omits auth entirely when no credentials are configured", () => {
    new SmtpTransport(buildConfig());

    expect(mockedCreateTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: "localhost",
        port: 1025,
        secure: false,
        auth: undefined,
      }),
    );
  });

  it("passes credentials through when both are configured", () => {
    new SmtpTransport(
      buildConfig({
        host: "smtp.eu.mailgun.org",
        port: 465,
        secure: true,
        user: "postmaster@hairo.app",
        password: "secret",
      }),
    );

    expect(mockedCreateTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: "smtp.eu.mailgun.org",
        port: 465,
        secure: true,
        auth: { user: "postmaster@hairo.app", pass: "secret" },
      }),
    );
  });

  it("sends the message with the configured from address", async () => {
    const transport = new SmtpTransport(buildConfig());

    await transport.sendMail({
      to: "user@example.com",
      subject: "Код подтверждения Hairo",
      html: "<p>123456</p>",
      text: "123456",
    });

    expect(sendMail).toHaveBeenCalledWith({
      from: "Hairo <noreply@hairo.local>",
      to: "user@example.com",
      subject: "Код подтверждения Hairo",
      html: "<p>123456</p>",
      text: "123456",
    });
  });

  it("propagates transport failures instead of swallowing them", async () => {
    sendMail.mockRejectedValue(new Error("ECONNREFUSED"));
    const transport = new SmtpTransport(buildConfig());

    await expect(
      transport.sendMail({
        to: "user@example.com",
        subject: "s",
        html: "h",
        text: "t",
      }),
    ).rejects.toThrow("ECONNREFUSED");
  });
});
