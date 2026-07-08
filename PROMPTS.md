# Hairo — Промпт-шаблоны

> Шаблоны промптов для image-модели (Nano Banana / Gemini 2.5 Flash Image) и для vision-анализа фото (`llm-model`, Gemini 2.5 Flash).
> **Статус: плейсхолдеры (Фаза 0).** Промпты — непрерывно дорабатываемый трек; финальная доводка с Валерией и на реальных прогонах. Промпты на английском — модели на нём точнее.
> Связано: `CATALOG.md` 3.1 (борьба с подмешиванием лица), `data/hairstyles.seed.json` (`hairstyle_fragment` на каждый образ).

---

## Переменные (слоты)

| Слот | Источник |
|---|---|
| `{user_photo}` | улучшенное селфи пользователя (image #1) |
| `{style_reference}` | **безликий** референс образа (image #2), см. `CATALOG.md` 3.1 |
| `{hairstyle_fragment}` | поле `hairstyle_fragment` из карточки (`hairstyles.seed.json`) |
| `{model}` | пол/тип внешности для генерации каталога (из `gender_presentation`) |
| `{color_fragment}` | `ColorOption.prompt_fragment` или пусто |

---

## Промпт A — Генерация превью каталога (text-to-image)

Создаёт превью-картинку образа для UI. Каркас (`house_style_scaffold` в seed) + `hairstyle_fragment`:

```
Professional studio portrait, head and shoulders, front-facing, neutral expression,
{model}, {hairstyle_fragment}, natural hair color,
plain light-grey seamless background, soft even studio lighting,
sharp focus, photorealistic, high detail, natural skin texture.
```

Из превью затем получаем **безликий референс** маскированием области лица (`CATALOG.md` 3.1).

## Промпт B — Улучшение фото (шаг 3 флоу)

Поднимает качество селфи, **не меняя личность**. Без «бьютификации» — нужен реальный человек.

```
Enhance the quality of this portrait photo. Improve sharpness, lighting and colour
balance, reduce noise and compression artefacts, recover natural detail.
Keep the person's identity, facial features, skin texture, age and expression exactly
the same — do not beautify, reshape, slim or alter the face. Do not change the hairstyle
or background. Natural, realistic, photorealistic result.
```

## Промпт C — Генерация причёски на пользователе (шаг 8 флоу) ⭐ ключевой

Гибрид: фото пользователя + безликий референс + fragment + цвет. С защитой от identity bleed.

```
Use the first image as the person. Restyle only their hair to match the hairstyle
shown in the second reference image.
Apply this hairstyle: {hairstyle_fragment}. {color_clause}
Keep the person's face, identity, skin tone, facial features, age and expression
completely unchanged — change ONLY the hair. Do not borrow any facial features from
the reference image. Blend the new hairstyle naturally with their head shape and the
photo's lighting. Photorealistic, high detail, single person.
```

- `{color_clause}`:
  - сменить цвет → `Hair colour: {color_fragment}.`
  - оставить свой → `Keep the original natural hair colour.`

### Защита от подмешивания лица (двойная)
1. `{style_reference}` — **без лица** (нечего подмешивать).
2. Явные инструкции в промпте: `change ONLY the hair` + `Do not borrow any facial features from the reference image` + `identity … unchanged`.

### Фолбэк: только текст (provisional)
Если тест покажет, что референс не нужен — убрать упоминание второй картинки, оставить `{hairstyle_fragment}` текстом. Подтвердить у Валерии (см. `CATALOG.md` 3.1).

## Промпт D — Анализ фото (structured output, `llm-model`)

Не image-модель — обычный Gemini (`gemini-2.5-flash`) с `responseSchema` (JSON, не картинка). Определяет форму лица, длину/текстуру/густоту волос, гендер-подачу и текущий цвет — поля из таксономии `CATALOG.md` §1-2. Используется в модуле `face-analysis` (`api/src/face-analysis/constants/index.ts`).

```
Analyze the person's face and hair in this photo.
Return a single JSON object describing:
- faceShape: their face shape.
- length: their current hair length.
- texture: their current hair texture(s), can be more than one if mixed.
- density: how thick/dense their hair looks.
- genderPresentation: their apparent gender presentation.
- currentColorDescription: a short natural-language description of their current hair colour.
Base every field strictly on what is visible in the photo. Do not guess beyond the image.
```

Допустимые значения полей заданы через `enum` в `responseSchema` (не в тексте промпта) — контролируемый словарь `CATALOG.md` §1-2.

---

## Открытые вопросы (доводка)

- [ ] Подтвердить формулировки на реальных прогонах модели.
- [ ] Гайд-рейлы под конкретное API (Gemini не использует «negative prompt» как SD — всё инструкциями в тексте).
- [ ] Сценарий смены длины/цвета на сложных текстурах (кудри/афро) — не «ломается» ли лицо.
- [ ] Финальные промпты сверить с ручными наработками Валерии.
