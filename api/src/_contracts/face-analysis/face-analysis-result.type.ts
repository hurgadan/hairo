import {
  FaceShape,
  GenderPresentation,
  HairDensity,
  HairLength,
  HairTexture,
} from "../enums";

export interface FaceAnalysisResult {
  faceShape: FaceShape;
  length: HairLength;
  /** Может быть несколько (смешанная текстура). */
  texture: HairTexture[];
  density: HairDensity;
  genderPresentation: GenderPresentation;
  /** Свободное текстовое описание текущего цвета волос. */
  currentColorDescription: string;
}
