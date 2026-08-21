import * as fs from "node:fs";
import * as path from "node:path";

import * as handlebars from "handlebars";

import { Locale } from "../../_contracts/users/enums/locale.enum";

/**
 * Язык, на который откатываемся, когда перевода шаблона нет. Русский: плацдарм
 * — русскоязычная диаспора, его тексты пишутся первыми и есть всегда.
 */
export const FALLBACK_LOCALE = Locale.Ru;

export type LocalizedTemplates = Record<Locale, handlebars.TemplateDelegate>;

/**
 * Компилирует шаблон на каждую локаль — один раз, на старте модуля, чтобы
 * рендер письма или сообщения бота не ходил на диск.
 *
 * Нет файла для языка — берётся `FALLBACK_LOCALE`: новый язык в `Locale` не
 * должен ронять приложение до того, как для него написаны тексты.
 */
export function compileLocalizedTemplates(
  templatesDir: string,
  fileName: string,
): LocalizedTemplates {
  const compiled = {} as LocalizedTemplates;

  for (const locale of Object.values(Locale)) {
    const file = resolveFile(templatesDir, locale, fileName);
    compiled[locale] = handlebars.compile(fs.readFileSync(file, "utf8"));
  }

  return compiled;
}

function resolveFile(
  templatesDir: string,
  locale: Locale,
  fileName: string,
): string {
  const localized = path.join(templatesDir, locale, fileName);
  return fs.existsSync(localized)
    ? localized
    : path.join(templatesDir, FALLBACK_LOCALE, fileName);
}
