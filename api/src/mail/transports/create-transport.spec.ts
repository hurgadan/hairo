import { ConfigService } from "@nestjs/config";

import { AppConfig } from "../../_common/types";
import { MailProvider } from "../enums";

import { createTransport } from "./create-transport";
import { LogTransport } from "./log-transport";
import { SmtpTransport } from "./smtp-transport";

jest.mock("./log-transport");
jest.mock("./smtp-transport");

describe("createTransport", () => {
  const MockedLogTransport = jest.mocked(LogTransport);
  const MockedSmtpTransport = jest.mocked(SmtpTransport);

  beforeEach(() => {
    MockedLogTransport.mockClear();
    MockedLogTransport.itIsMe.mockReset();
    MockedSmtpTransport.mockClear();
    MockedSmtpTransport.itIsMe.mockReset();
  });

  const buildConfig = (provider: string): ConfigService<AppConfig, true> =>
    ({
      getOrThrow: jest.fn().mockReturnValue({ provider }),
    }) as unknown as ConfigService<AppConfig, true>;

  it("instantiates the transport whose itIsMe matches", () => {
    MockedSmtpTransport.itIsMe.mockReturnValue(true);
    MockedLogTransport.itIsMe.mockReturnValue(false);
    const config = buildConfig(MailProvider.Smtp);

    const transport = createTransport(config);

    expect(transport).toBeInstanceOf(MockedSmtpTransport);
    expect(MockedSmtpTransport).toHaveBeenCalledWith(config);
    expect(MockedLogTransport).not.toHaveBeenCalled();
  });

  it("falls to the log transport when it is the one that matches", () => {
    MockedSmtpTransport.itIsMe.mockReturnValue(false);
    MockedLogTransport.itIsMe.mockReturnValue(true);

    const transport = createTransport(buildConfig(MailProvider.Log));

    expect(transport).toBeInstanceOf(MockedLogTransport);
    expect(MockedSmtpTransport).not.toHaveBeenCalled();
  });

  it("throws for a provider no known transport recognizes", () => {
    MockedSmtpTransport.itIsMe.mockReturnValue(false);
    MockedLogTransport.itIsMe.mockReturnValue(false);

    expect(() => createTransport(buildConfig("carrier-pigeon"))).toThrow(
      "Unknown mail provider: carrier-pigeon",
    );
  });
});
