import { Injectable, Logger, NotFoundException } from "@nestjs/common";

import { FaceAnalysisStatus } from "../../_contracts/face-analysis/enums";
import { FaceAnalysisResult } from "../../_contracts/face-analysis/face-analysis-result.type";
import { LlmModelService } from "../../llm-model/llm-model.service";
import { PhotosService } from "../../photos/services/photos.service";
import { StorageService } from "../../storage/services/storage.service";
import {
  FACE_ANALYSIS_PROMPT,
  FACE_ANALYSIS_RESPONSE_SCHEMA,
} from "../constants";
import { PhotoAnalysis } from "../dao/photo-analysis.entity";
import { FaceAnalysisRepository } from "../repositories/face-analysis.repository";

@Injectable()
export class FaceAnalysisService {
  private readonly logger = new Logger(FaceAnalysisService.name);

  constructor(
    private readonly analyses: FaceAnalysisRepository,
    private readonly photos: PhotosService,
    private readonly storage: StorageService,
    private readonly llmModel: LlmModelService,
  ) {}

  /** Создаёт задание и запускает анализ в фоне (fire-and-forget) — см. `TECH.md`. */
  public async start(userId: string, photoId: string): Promise<PhotoAnalysis> {
    // getOwned бросит NotFoundException, если фото чужое/не существует
    await this.photos.getOwned(userId, photoId);

    const analysis = await this.analyses.save({
      userId,
      photoId,
      status: FaceAnalysisStatus.Pending,
    });

    this.run(analysis.id, userId, photoId).catch((error: unknown) => {
      this.logger.error(
        `face-analysis ${analysis.id} crashed outside of run()`,
        error instanceof Error ? error.stack : error,
      );
    });

    return analysis;
  }

  public async getOwned(userId: string, id: string): Promise<PhotoAnalysis> {
    const analysis = await this.analyses.findOwned(id, userId);
    if (!analysis) {
      throw new NotFoundException("Analysis not found");
    }
    return analysis;
  }

  private async run(
    id: string,
    userId: string,
    photoId: string,
  ): Promise<void> {
    try {
      const photo = await this.photos.getOwned(userId, photoId);
      const bytes = await this.storage.getObject(photo.storageKey);

      const result = await this.llmModel.generateStructured<FaceAnalysisResult>(
        {
          images: [{ data: bytes, mimeType: photo.contentType }],
          prompt: FACE_ANALYSIS_PROMPT,
          responseSchema: FACE_ANALYSIS_RESPONSE_SCHEMA,
        },
      );

      await this.analyses.update(id, {
        status: FaceAnalysisStatus.Completed,
        result,
      });
    } catch (error) {
      this.logger.error(
        `face-analysis ${id} failed`,
        error instanceof Error ? error.stack : error,
      );
      await this.analyses.update(id, {
        status: FaceAnalysisStatus.Failed,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
