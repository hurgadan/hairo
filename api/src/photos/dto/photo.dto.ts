import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

import { TransformToDateString } from "../../_common/utils/decorators/transform-to-date-string.decorator";
import { PhotoKind, PhotoStatus } from "../../_contracts/photos/enums";
import { Photo } from "../../_contracts/photos/photo.type";

export class PhotoDto implements Photo {
  @ApiProperty()
  @Expose()
  public id: string;

  @ApiProperty({ enum: PhotoKind })
  @Expose()
  public kind: PhotoKind;

  @ApiProperty({ enum: PhotoStatus })
  @Expose()
  public status: PhotoStatus;

  @ApiProperty()
  @Expose()
  public contentType: string;

  @ApiProperty()
  @Expose()
  public sizeBytes: number;

  @ApiProperty()
  @Expose()
  public url: string;

  @ApiProperty()
  @Expose()
  @TransformToDateString()
  public createdAt: string;
}
