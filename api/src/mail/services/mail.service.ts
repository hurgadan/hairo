import * as fs from "node:fs";
import * as path from "node:path";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as handlebars from "handlebars";

import { AppConfig } from "../../_common/types";
import {
  TEMPLATES_DIR,
  VERIFICATION_CODE_SUBJECT,
  VERIFICATION_CODE_TEMPLATE,
} from "../constants";
import { BaseTransport } from "../transports/base-transport";
import { createTransport } from "../transports/create-transport";

export interface ISendVerificationCode {
  to: string;
  code: string;
  /** Срок жизни кода — подставляется в текст письма (владелец срока — вызывающий модуль). */
  expiresInMinutes: number;
}

type TemplatePair = {
  html: handlebars.TemplateDelegate;
  text: handlebars.TemplateDelegate;
};

/**
 * Единственная точка отправки писем. Работает с абстракцией `BaseTransport`
 * и не знает, кто именно доставляет письмо — транспорт выбирает фабрика по env.
 */
@Injectable()
export class MailService {
  private readonly transport: BaseTransport;
  private readonly verificationCode: TemplatePair;

  constructor(private readonly config: ConfigService<AppConfig, true>) {
    this.transport = createTransport(this.config);
    // Шаблоны компилируются один раз на старте — рендер письма не читает диск.
    this.verificationCode = compileTemplate(VERIFICATION_CODE_TEMPLATE);
  }

  public async sendVerificationCode(
    param: ISendVerificationCode,
  ): Promise<void> {
    const context = {
      code: param.code,
      expiresInMinutes: param.expiresInMinutes,
      subject: VERIFICATION_CODE_SUBJECT,
    };

    await this.transport.sendMail({
      to: param.to,
      subject: VERIFICATION_CODE_SUBJECT,
      html: this.verificationCode.html(context),
      text: this.verificationCode.text(context),
    });
  }
}

function compileTemplate(name: string): TemplatePair {
  const read = (extension: "html" | "text"): handlebars.TemplateDelegate =>
    handlebars.compile(
      fs.readFileSync(
        path.join(__dirname, "..", TEMPLATES_DIR, `${name}.${extension}.hbs`),
        "utf8",
      ),
    );

  return { html: read("html"), text: read("text") };
}
