export const GENERATIONS_TABLE = "generations";

/** Префикс ключа в хранилище: generations/{userId}/{generationId}.png */
export const GENERATION_STORAGE_PREFIX = "generations";

/** Nano Banana / Gemini 2.5 Flash Image отдаёт PNG; ImageModelService не возвращает mime из ответа. */
export const GENERATED_IMAGE_MIME_TYPE = "image/png";

// Промпт B (`PROMPTS.md`) — англ., как остальные промпты (модель точнее на английском).
export const ENHANCE_PROMPT = `Enhance the quality of this portrait photo. Improve sharpness, lighting and colour
balance, reduce noise and compression artefacts, recover natural detail.
Keep the person's identity, facial features, skin texture, age and expression exactly
the same — do not beautify, reshape, slim or alter the face. Do not change the hairstyle
or background. Natural, realistic, photorealistic result.`;

/**
 * Промпт C (`PROMPTS.md`), text-only фолбэк («Фолбэк: только текст (provisional)») —
 * без второй референс-картинки и связанных с ней инструкций, т.к. у каталожных причёсок
 * ещё нет referenceImage (CATALOG.md §3.1). `hairstyleFragment` — из выбранной
 * пользователем причёски (`Hairstyle.hairstyleFragment`, каталог).
 */
export function buildRestylePrompt(hairstyleFragment: string): string {
  return `Restyle only the person's hair to: ${hairstyleFragment}. Keep the original natural hair colour.
Keep the person's face, identity, skin tone, facial features, age and expression
completely unchanged — change ONLY the hair. Blend the new hairstyle naturally with
their head shape and the photo's lighting. Photorealistic, high detail, single person.`;
}
