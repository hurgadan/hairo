import { ConfigService } from "@nestjs/config";

import { AppConfig } from "../../_common/types";

export interface ISendMail {
  to: string;
  subject: string;
  /** HTML-версия письма. */
  html: string;
  /** Текстовая версия — для клиентов без HTML и для спам-скоринга. */
  text: string;
}

export abstract class BaseTransport {
  /** config нужен только для формы конструктора (см. `BaseTransportCtor`) — что с ним делать, решает конкретный транспорт. */
  protected constructor(_config: ConfigService<AppConfig, true>) {}

  public abstract sendMail(mail: ISendMail): Promise<void>;
}

export type BaseTransportCtor = {
  new (config: ConfigService<AppConfig, true>): BaseTransport;

  itIsMe(provider: string): boolean;
};
