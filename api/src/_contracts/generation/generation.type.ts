import { GenerationStatus } from "./enums/generation-status.enum";

export interface Generation {
  id: string;
  photoId: string;
  hairstyleId: string;
  status: GenerationStatus;
  resultUrl: string | null;
  error: string | null;
  createdAt: string;
}
