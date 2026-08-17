import type { LocalizedText } from "@hurgadan/hairo-contracts";

/**
 * Текст каталога на нужном языке. Фолбэк — русский: переводы карточек на es/de
 * появятся срезом 2 Фазы 5, а до тех пор пустое место было бы хуже русского.
 */
export function pickLocalized(
  text: LocalizedText | null | undefined,
  locale: string,
): string | null {
  if (!text) return null;
  return text[locale as keyof LocalizedText] ?? text.ru ?? null;
}
