import { PhotoKind } from "./enums/photo-kind.enum";
import { PhotoStatus } from "./enums/photo-status.enum";

export interface Photo {
  id: string;
  kind: PhotoKind;
  status: PhotoStatus;
  contentType: string;
  sizeBytes: number;
  /** URL для отображения (CDN или presigned). Может протухать — не хранить долго. */
  url: string;
  createdAt: string;
}
