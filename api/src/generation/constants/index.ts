export const GENERATIONS_TABLE = "generations";

/** Префикс ключа в хранилище: generations/{userId}/{generationId}.png */
export const GENERATION_STORAGE_PREFIX = "generations";

/** Nano Banana / Gemini 2.5 Flash Image отдаёт PNG; ImageModelService не возвращает mime из ответа. */
export const GENERATED_IMAGE_MIME_TYPE = "image/png";

/**
 * Плейсхолдер Фазы 2 (см. ROADMAP.md — «без каталога и визарда»): единственный
 * фиксированный образ вместо выбора из каталога. Заменяется реальным выбором
 * причёски в Фазе 3.
 */
export const PLACEHOLDER_HAIRSTYLE_FRAGMENT =
  "long layered hair past the chest, soft face-framing layers, smooth voluminous blowout";

// Промпт B (`PROMPTS.md`) — англ., как остальные промпты (модель точнее на английском).
export const ENHANCE_PROMPT = `Enhance the quality of this portrait photo. Improve sharpness, lighting and colour
balance, reduce noise and compression artefacts, recover natural detail.
Keep the person's identity, facial features, skin texture, age and expression exactly
the same — do not beautify, reshape, slim or alter the face. Do not change the hairstyle
or background. Natural, realistic, photorealistic result.`;

/**
 * Промпт C (`PROMPTS.md`), text-only фолбэк («Фолбэк: только текст (provisional)») —
 * без второй референс-картинки и связанных с ней инструкций, т.к. у каталожных причёсок
 * ещё нет referenceImage (CATALOG.md §3.1).
 */
export function buildRestylePrompt(): string {
  return `Restyle only the person's hair to: ${PLACEHOLDER_HAIRSTYLE_FRAGMENT}. Keep the original natural hair colour.
Keep the person's face, identity, skin tone, facial features, age and expression
completely unchanged — change ONLY the hair. Blend the new hairstyle naturally with
their head shape and the photo's lighting. Photorealistic, high detail, single person.`;
}
