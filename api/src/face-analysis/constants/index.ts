import { Schema, Type } from "@google/genai";

import {
  FaceShape,
  GenderPresentation,
  HairDensity,
  HairLength,
  HairTexture,
} from "../../_contracts/enums";

export const PHOTO_ANALYSES_TABLE = "photo_analyses";

// Промпт D (`PROMPTS.md`) — англ., как остальные промпты (модель точнее на английском).
export const FACE_ANALYSIS_PROMPT = `Analyze the person's face and hair in this photo.
Return a single JSON object describing:
- faceShape: their face shape.
- length: their current hair length.
- texture: their current hair texture(s), can be more than one if mixed.
- density: how thick/dense their hair looks.
- genderPresentation: their apparent gender presentation.
- currentColorDescription: a short natural-language description of their current hair colour.
Base every field strictly on what is visible in the photo. Do not guess beyond the image.`;

// Контролируемый словарь (CATALOG.md §1-2) для схемы ответа LLM берём из enum'ов контракта —
// один источник правды и для типа поля, и для допустимых значений в запросе к модели.
export const FACE_ANALYSIS_RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    faceShape: { type: Type.STRING, enum: Object.values(FaceShape) },
    length: { type: Type.STRING, enum: Object.values(HairLength) },
    texture: {
      type: Type.ARRAY,
      items: { type: Type.STRING, enum: Object.values(HairTexture) },
    },
    density: { type: Type.STRING, enum: Object.values(HairDensity) },
    genderPresentation: {
      type: Type.STRING,
      enum: Object.values(GenderPresentation),
    },
    currentColorDescription: { type: Type.STRING },
  },
  required: [
    "faceShape",
    "length",
    "texture",
    "density",
    "genderPresentation",
    "currentColorDescription",
  ],
};
