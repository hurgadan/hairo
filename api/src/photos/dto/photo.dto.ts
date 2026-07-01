import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

import { TransformToDateString } from "../../_common/utils/decorators/transform-to-date-string.decorator";
import { Photo } from "../../_contracts/photos/photo.type";

export class PhotoDto implements Photo {
  @ApiProperty()
  @Expose()
  public id: string;

  @ApiProperty()
  @Expose()
  public kind: string;

  @ApiProperty()
  @Expose()
  public status: string;

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
