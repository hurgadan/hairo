import { ConfigService } from "@nestjs/config";

import { AppConfig } from "../../_common/types";

import { BaseTransport, BaseTransportCtor } from "./base-transport";
import { LogTransport } from "./log-transport";
import { SmtpTransport } from "./smtp-transport";

const transports: BaseTransportCtor[] = [SmtpTransport, LogTransport];

/**
 * Собирает транспорт под значение `MAIL_PROVIDER`. Новый провайдер (напр.
 * Mailgun/Postmark через их HTTP API) добавляется классом с `itIsMe` и одной
 * строкой в этом списке — сервис и вызывающий код не меняются.
 */
export function createTransport(
  config: ConfigService<AppConfig, true>,
): BaseTransport {
  const { provider } = config.getOrThrow("mail", { infer: true });

  const Ctor = transports.find((transport) => transport.itIsMe(provider));

  if (!Ctor) {
    throw new Error(`Unknown mail provider: ${provider}`);
  }

  return new Ctor(config);
}
