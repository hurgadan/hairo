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
import { CreateGenerationDto } from "../dto/create-generation.dto";
import { GenerationDto } from "../dto/generation.dto";
import { GenerationService } from "../services/generation.service";

@ApiTags("generation")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("generation")
export class GenerationController {
  constructor(private readonly generation: GenerationService) {}

  @Post()
  @HttpCode(202)
  public async create(
    @CurrentUser() current: AuthenticatedUser,
    @Body() dto: CreateGenerationDto,
  ): Promise<GenerationDto> {
    return transformToDto(
      GenerationDto,
      await this.generation.start(current.userId, dto.photoId),
    );
  }

  @Get(":id")
  public async get(
    @CurrentUser() current: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<GenerationDto> {
    return transformToDto(
      GenerationDto,
      await this.generation.getOwned(current.userId, id),
    );
  }
}
