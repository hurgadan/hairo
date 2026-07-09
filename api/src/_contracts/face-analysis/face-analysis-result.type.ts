import { FaceShape } from "./enums/face-shape.enum";
import { GenderPresentation } from "./enums/gender-presentation.enum";
import { HairDensity } from "./enums/hair-density.enum";
import { HairLength } from "./enums/hair-length.enum";
import { HairTexture } from "./enums/hair-texture.enum";

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
