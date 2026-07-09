import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { transformToDto } from "../../_common/utils/transform-to-dto";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import type { AuthenticatedUser } from "../../auth/types/jwt-payload.type";
import { PhotoAnalysisDto } from "../dto/photo-analysis.dto";
import { StartFaceAnalysisDto } from "../dto/start-face-analysis.dto";
import { FaceAnalysisService } from "../services/face-analysis.service";

@ApiTags("face-analysis")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("face-analysis")
export class FaceAnalysisController {
  constructor(private readonly faceAnalysis: FaceAnalysisService) {}

  @Post()
  @HttpCode(202)
  public async start(
    @CurrentUser() current: AuthenticatedUser,
    @Body() dto: StartFaceAnalysisDto,
  ): Promise<PhotoAnalysisDto> {
    return transformToDto(
      PhotoAnalysisDto,
      await this.faceAnalysis.start(current.userId, dto.photoId),
    );
  }

  @Get(":id")
  public async get(
    @CurrentUser() current: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<PhotoAnalysisDto> {
    return transformToDto(
      PhotoAnalysisDto,
      await this.faceAnalysis.getOwned(current.userId, id),
    );
  }
}
