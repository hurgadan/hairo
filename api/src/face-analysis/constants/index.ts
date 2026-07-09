import { Schema, Type } from "@google/genai";

export const PHOTO_ANALYSES_TABLE = "photo_analyses";

export const FACE_ANALYSIS_STATUS = {
  pending: "pending",
  completed: "completed",
  failed: "failed",
} as const;

// Таксономия по CATALOG.md §1-2 — контролируемый словарь для схемы ответа LLM.
export const FACE_SHAPES = [
  "oval",
  "round",
  "square",
  "heart",
  "oblong",
  "diamond",
] as const;

export const HAIR_LENGTHS = [
  "buzz",
  "short",
  "chin",
  "shoulder",
  "mid",
  "long",
] as const;

export const HAIR_TEXTURES = ["straight", "wavy", "curly", "coily"] as const;

export const HAIR_DENSITIES = ["fine", "medium", "thick"] as const;

export const GENDER_PRESENTATIONS = [
  "feminine",
  "masculine",
  "unisex",
] as const;

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

export const FACE_ANALYSIS_RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    faceShape: { type: Type.STRING, enum: [...FACE_SHAPES] },
    length: { type: Type.STRING, enum: [...HAIR_LENGTHS] },
    texture: {
      type: Type.ARRAY,
      items: { type: Type.STRING, enum: [...HAIR_TEXTURES] },
    },
    density: { type: Type.STRING, enum: [...HAIR_DENSITIES] },
    genderPresentation: { type: Type.STRING, enum: [...GENDER_PRESENTATIONS] },
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
