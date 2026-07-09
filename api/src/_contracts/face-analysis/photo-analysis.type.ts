export enum FaceShape {
  Oval = "oval",
  Round = "round",
  Square = "square",
  Heart = "heart",
  Oblong = "oblong",
  Diamond = "diamond",
}

export enum HairLength {
  Buzz = "buzz",
  Short = "short",
  Chin = "chin",
  Shoulder = "shoulder",
  Mid = "mid",
  Long = "long",
}

export enum HairTexture {
  Straight = "straight",
  Wavy = "wavy",
  Curly = "curly",
  Coily = "coily",
}

export enum HairDensity {
  Fine = "fine",
  Medium = "medium",
  Thick = "thick",
}

export enum GenderPresentation {
  Feminine = "feminine",
  Masculine = "masculine",
  Unisex = "unisex",
}

export enum FaceAnalysisStatus {
  Pending = "pending",
  Completed = "completed",
  Failed = "failed",
}

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

export interface PhotoAnalysis {
  id: string;
  photoId: string;
  status: FaceAnalysisStatus;
  result: FaceAnalysisResult | null;
  error: string | null;
  createdAt: string;
}
