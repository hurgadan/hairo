import * as fs from "node:fs";
import * as path from "node:path";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as handlebars from "handlebars";

import { AppConfig } from "../../_common/types";
import { Locale } from "../../_contracts/users/enums/locale.enum";
import {
  FALLBACK_MAIL_LOCALE,
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
  /** Язык письма; без него — фолбэк-локаль. */
  locale?: Locale;
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
  private readonly verificationCode: Record<Locale, TemplatePair>;

  constructor(private readonly config: ConfigService<AppConfig, true>) {
    this.transport = createTransport(this.config);
    // Шаблоны компилируются один раз на старте — рендер письма не читает диск.
    this.verificationCode = compileForAllLocales(VERIFICATION_CODE_TEMPLATE);
  }

  public async sendVerificationCode(
    param: ISendVerificationCode,
  ): Promise<void> {
    const locale = param.locale ?? FALLBACK_MAIL_LOCALE;
    const subject = VERIFICATION_CODE_SUBJECT[locale];
    const template = this.verificationCode[locale];

    const context = {
      code: param.code,
      expiresInMinutes: param.expiresInMinutes,
      subject,
    };

    await this.transport.sendMail({
      to: param.to,
      subject,
      html: template.html(context),
      text: template.text(context),
    });
  }
}

function compileForAllLocales(name: string): Record<Locale, TemplatePair> {
  const compiled = {} as Record<Locale, TemplatePair>;
  for (const locale of Object.values(Locale)) {
    compiled[locale] = compileTemplate(name, locale);
  }
  return compiled;
}

function compileTemplate(name: string, locale: Locale): TemplatePair {
  const read = (extension: "html" | "text"): handlebars.TemplateDelegate =>
    handlebars.compile(
      fs.readFileSync(resolveFile(name, locale, extension), "utf8"),
    );

  return { html: read("html"), text: read("text") };
}

/**
 * Файл шаблона для языка, иначе — фолбэк-локаль. Так новый язык в `Locale`
 * не роняет старт приложения, пока для него не написаны письма.
 */
function resolveFile(
  name: string,
  locale: Locale,
  extension: "html" | "text",
): string {
  const at = (dir: Locale): string =>
    path.join(__dirname, "..", TEMPLATES_DIR, dir, `${name}.${extension}.hbs`);

  const localized = at(locale);
  return fs.existsSync(localized) ? localized : at(FALLBACK_MAIL_LOCALE);
}
