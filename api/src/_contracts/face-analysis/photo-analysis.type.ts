import { FaceAnalysisStatus } from "./enums/face-analysis-status.enum";
import { FaceAnalysisResult } from "./face-analysis-result.type";

export interface PhotoAnalysis {
  id: string;
  photoId: string;
  status: FaceAnalysisStatus;
  result: FaceAnalysisResult | null;
  error: string | null;
  createdAt: string;
}
