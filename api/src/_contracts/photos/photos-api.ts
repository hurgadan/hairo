import { ApiBase } from "../api-base";
import { Photo } from "./photo.type";

export abstract class PhotosApi implements ApiBase {
  public readonly baseUrl = "/photos";

  // multipart/form-data: поле `file` (image/jpeg|png|webp, blob) + `consent=true`.
  // Тип file — `unknown`: контракт не тянет DOM/Node lib; фронт передаёт File/Blob.
  protected abstract upload(file: unknown, consent: boolean): Promise<Photo>;
  protected abstract list(): Promise<Photo[]>;
  protected abstract get(id: string): Promise<Photo>;
  protected abstract remove(id: string): Promise<void>;
}
