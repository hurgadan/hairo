import { randomUUID } from "node:crypto";

import { Injectable, NotFoundException } from "@nestjs/common";

import { PhotoKind, PhotoStatus } from "../../_contracts/photos/enums";
import { StorageService } from "../../storage/services/storage.service";
import { PHOTO_MIME_EXTENSIONS, PHOTO_STORAGE_PREFIX } from "../constants";
import { Photo } from "../dao/photo.entity";
import { PhotosRepository } from "../repositories/photos.repository";

/** Фото + актуальный URL для отдачи (не хранится в БД). */
export type PhotoView = Photo & { url: string };

@Injectable()
export class PhotosService {
  constructor(
    private readonly photos: PhotosRepository,
    private readonly storage: StorageService,
  ) {}

  public async uploadSelfie(
    userId: string,
    file: Express.Multer.File,
  ): Promise<PhotoView> {
    const id = randomUUID();
    const ext = PHOTO_MIME_EXTENSIONS[file.mimetype];
    const storageKey = `${PHOTO_STORAGE_PREFIX}/${userId}/${id}.${ext}`;

    await this.storage.putObject({
      key: storageKey,
      body: file.buffer,
      contentType: file.mimetype,
    });

    const photo = await this.photos.save({
      id,
      userId,
      storageKey,
      kind: PhotoKind.Selfie,
      status: PhotoStatus.Uploaded,
      contentType: file.mimetype,
      sizeBytes: file.size,
      consentAt: new Date(),
    });

    return this.withUrl(photo);
  }

  public async list(userId: string): Promise<PhotoView[]> {
    const photos = await this.photos.findByUser(userId);
    return Promise.all(photos.map((photo) => this.withUrl(photo)));
  }

  public async getOwned(userId: string, id: string): Promise<PhotoView> {
    return this.withUrl(await this.findOwnedOrFail(userId, id));
  }

  public async remove(userId: string, id: string): Promise<void> {
    const photo = await this.findOwnedOrFail(userId, id);
    await this.storage.deleteObject(photo.storageKey);
    await this.photos.remove(photo);
  }

  private async findOwnedOrFail(userId: string, id: string): Promise<Photo> {
    const photo = await this.photos.findOwned(id, userId);
    if (!photo) {
      throw new NotFoundException("Photo not found");
    }
    return photo;
  }

  private async withUrl(photo: Photo): Promise<PhotoView> {
    const url =
      this.storage.getPublicUrl(photo.storageKey) ??
      (await this.storage.getSignedDownloadUrl(photo.storageKey));
    return Object.assign(photo, { url });
  }
}
