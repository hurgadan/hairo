import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { LlmModelModule } from "../llm-model/llm-model.module";
import { PhotosModule } from "../photos/photos.module";
import { FaceAnalysisController } from "./controllers/face-analysis.controller";
import { PhotoAnalysis } from "./dao/photo-analysis.entity";
import { FaceAnalysisRepository } from "./repositories/face-analysis.repository";
import { FaceAnalysisService } from "./services/face-analysis.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([PhotoAnalysis]),
    PhotosModule,
    LlmModelModule,
  ],
  controllers: [FaceAnalysisController],
  providers: [FaceAnalysisRepository, FaceAnalysisService],
})
export class FaceAnalysisModule {}
