export interface FaceAnalysisResult {
  /** oval | round | square | heart | oblong | diamond */
  faceShape: string;
  /** buzz | short | chin | shoulder | mid | long */
  length: string;
  /** straight | wavy | curly | coily (может быть несколько) */
  texture: string[];
  /** fine | medium | thick */
  density: string;
  /** feminine | masculine | unisex */
  genderPresentation: string;
  /** Свободное текстовое описание текущего цвета волос. */
  currentColorDescription: string;
}

export interface PhotoAnalysis {
  id: string;
  photoId: string;
  /** 'pending' | 'completed' | 'failed' */
  status: string;
  result: FaceAnalysisResult | null;
  error: string | null;
  createdAt: string;
}
