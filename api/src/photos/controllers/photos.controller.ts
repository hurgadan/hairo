import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from "@nestjs/swagger";

import { transformToDto } from "../../_common/utils/transform-to-dto";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import type { AuthenticatedUser } from "../../auth/types/jwt-payload.type";
import { MAX_PHOTO_SIZE_BYTES } from "../constants";
import { PhotoDto } from "../dto/photo.dto";
import { UploadPhotoDto } from "../dto/upload-photo.dto";
import { PhotosService } from "../services/photos.service";

const PHOTO_FILE_TYPE = /^image\/(jpeg|png|webp)$/;

@ApiTags("photos")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("photos")
export class PhotosController {
  constructor(private readonly photos: PhotosService) {}

  @Post()
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      required: ["file", "consent"],
      properties: {
        file: { type: "string", format: "binary" },
        consent: { type: "boolean" },
      },
    },
  })
  public async upload(
    @CurrentUser() current: AuthenticatedUser,
    @Body() _dto: UploadPhotoDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_PHOTO_SIZE_BYTES }),
          // Проверяем MIME по регэкспу. Magic-number проверку отключаем: она в Nest
          // тянет опциональный ESM-пакет file-type, наличие которого недетерминировано
          // (падает под alpine/`npm ci`). Контент-валидация — позже, при ре-энкоде фото.
          new FileTypeValidator({
            fileType: PHOTO_FILE_TYPE,
            skipMagicNumbersValidation: true,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<PhotoDto> {
    return transformToDto(
      PhotoDto,
      await this.photos.uploadSelfie(current.userId, file),
    );
  }

  @Get()
  public async list(
    @CurrentUser() current: AuthenticatedUser,
  ): Promise<PhotoDto[]> {
    const photos = await this.photos.list(current.userId);
    return photos.map((photo) => transformToDto(PhotoDto, photo));
  }

  @Get(":id")
  public async get(
    @CurrentUser() current: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<PhotoDto> {
    return transformToDto(
      PhotoDto,
      await this.photos.getOwned(current.userId, id),
    );
  }

  @Delete(":id")
  @HttpCode(204)
  public async remove(
    @CurrentUser() current: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.photos.remove(current.userId, id);
  }
}
