import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { AppConfig } from "../../_common/types";
import { MailProvider } from "../enums";

import { LogTransport } from "./log-transport";

describe("LogTransport", () => {
  const buildConfig = (): ConfigService<AppConfig, true> =>
    ({
      getOrThrow: jest
        .fn()
        .mockReturnValue({ from: "Hairo <noreply@hairo.local>" }),
    }) as unknown as ConfigService<AppConfig, true>;

  it("claims only the log provider", () => {
    expect(LogTransport.itIsMe(MailProvider.Log)).toBe(true);
    expect(LogTransport.itIsMe(MailProvider.Smtp)).toBe(false);
  });

  it("logs the message body so the code is readable in dev", async () => {
    const log = jest.spyOn(Logger.prototype, "log").mockImplementation();
    const transport = new LogTransport(buildConfig());

    await transport.sendMail({
      to: "user@example.com",
      subject: "Код подтверждения Hairo",
      html: "<p>123456</p>",
      text: "Код для входа: 123456",
    });

    expect(log).toHaveBeenCalledTimes(1);
    const message = log.mock.calls[0][0] as string;
    expect(message).toContain("user@example.com");
    expect(message).toContain("Код для входа: 123456");

    log.mockRestore();
  });
});
