import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

import { GenerationStatus } from "../../_contracts/generation/enums";
import { Generation } from "../../_contracts/generation/generation.type";
import { TransformToDateString } from "../../_common/utils/decorators/transform-to-date-string.decorator";

export class GenerationDto implements Generation {
  @ApiProperty()
  @Expose()
  public id: string;

  @ApiProperty()
  @Expose()
  public photoId: string;

  @ApiProperty()
  @Expose()
  public hairstyleId: string;

  @ApiProperty({ enum: GenerationStatus })
  @Expose()
  public status: GenerationStatus;

  @ApiProperty({ nullable: true })
  @Expose()
  public resultUrl: string | null;

  @ApiProperty({ nullable: true })
  @Expose()
  public error: string | null;

  @ApiProperty()
  @Expose()
  @TransformToDateString()
  public createdAt: string;
}
