import { Injectable, Logger, NotFoundException } from "@nestjs/common";

import { GenerationStatus } from "../../_contracts";
import { CatalogService } from "../../catalog/services/catalog.service";
import { ImageModelService } from "../../image-model/image-model.service";
import { PhotosService } from "../../photos/services/photos.service";
import { StorageService } from "../../storage/services/storage.service";
import {
  buildRestylePrompt,
  ENHANCE_PROMPT,
  GENERATED_IMAGE_MIME_TYPE,
  GENERATION_STORAGE_PREFIX,
} from "../constants";
import { Generation } from "../dao/generation.entity";
import { GenerationRepository } from "../repositories/generation.repository";

/** Задание генерации + актуальный URL результата (не хранится в БД). */
export type GenerationView = Generation & { resultUrl: string | null };

@Injectable()
export class GenerationService {
  private readonly logger = new Logger(GenerationService.name);

  constructor(
    private readonly generations: GenerationRepository,
    private readonly photos: PhotosService,
    private readonly catalog: CatalogService,
    private readonly storage: StorageService,
    private readonly imageModel: ImageModelService,
  ) {}

  /** Создаёт задание и запускает пайплайн в фоне (fire-and-forget) — см. `TECH.md`. */
  public async start(
    userId: string,
    photoId: string,
    hairstyleId: string,
  ): Promise<GenerationView> {
    // getOwned/getActive бросят NotFoundException, если фото чужое или причёска не найдена/неактивна
    await this.photos.getOwned(userId, photoId);
    await this.catalog.getActive(hairstyleId);

    const generation = await this.generations.save({
      userId,
      photoId,
      hairstyleId,
      status: GenerationStatus.Pending,
    });

    this.run(generation.id, userId, photoId, hairstyleId).catch(
      (error: unknown) => {
        this.logger.error(
          `generation ${generation.id} crashed outside of run()`,
          error instanceof Error ? error.stack : error,
        );
      },
    );

    // Свежесозданный job ещё не имеет результата — resultUrl всегда null,
    // без похода в storage (и без лишнего await, чтобы вернуться до того,
    // как fire-and-forget `run()` продвинется дальше).
    return Object.assign(generation, { resultUrl: null });
  }

  public async getOwned(userId: string, id: string): Promise<GenerationView> {
    const generation = await this.generations.findOwned(id, userId);
    if (!generation) {
      throw new NotFoundException("Generation not found");
    }
    return this.withResultUrl(generation);
  }

  private async run(
    id: string,
    userId: string,
    photoId: string,
    hairstyleId: string,
  ): Promise<void> {
    try {
      const photo = await this.photos.getOwned(userId, photoId);
      const hairstyle = await this.catalog.getActive(hairstyleId);
      const selfie = await this.storage.getObject(photo.storageKey);

      const enhanced = await this.imageModel.generateImage({
        images: [{ data: selfie, mimeType: photo.contentType }],
        prompt: ENHANCE_PROMPT,
      });

      const restyled = await this.imageModel.generateImage({
        images: [{ data: enhanced, mimeType: GENERATED_IMAGE_MIME_TYPE }],
        prompt: buildRestylePrompt(hairstyle.hairstyleFragment),
      });

      const resultStorageKey = `${GENERATION_STORAGE_PREFIX}/${userId}/${id}.png`;
      await this.storage.putObject({
        key: resultStorageKey,
        body: restyled,
        contentType: GENERATED_IMAGE_MIME_TYPE,
      });

      await this.generations.update(id, {
        status: GenerationStatus.Completed,
        resultStorageKey,
        resultContentType: GENERATED_IMAGE_MIME_TYPE,
      });
    } catch (error) {
      this.logger.error(
        `generation ${id} failed`,
        error instanceof Error ? error.stack : error,
      );
      await this.generations.update(id, {
        status: GenerationStatus.Failed,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  private async withResultUrl(generation: Generation): Promise<GenerationView> {
    const url = generation.resultStorageKey
      ? (this.storage.getPublicUrl(generation.resultStorageKey) ??
        (await this.storage.getSignedDownloadUrl(generation.resultStorageKey)))
      : null;
    return Object.assign(generation, { resultUrl: url });
  }
}
