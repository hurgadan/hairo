import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";

import {
  FaceAnalysisResult,
  PhotoAnalysis,
} from "../../_contracts/face-analysis/photo-analysis.type";
import { TransformToDateString } from "../../_common/utils/decorators/transform-to-date-string.decorator";

export class PhotoAnalysisDto implements PhotoAnalysis {
  @ApiProperty()
  @Expose()
  public id: string;

  @ApiProperty()
  @Expose()
  public photoId: string;

  @ApiProperty()
  @Expose()
  public status: string;

  // jsonb — читаем из источника, иначе excludeExtraneousValues рекурсивно вычищает объект
  @ApiProperty({ type: Object, nullable: true })
  @Expose()
  @Transform(({ obj }) => obj.result, { toClassOnly: true })
  public result: FaceAnalysisResult | null;

  @ApiProperty({ nullable: true })
  @Expose()
  public error: string | null;

  @ApiProperty()
  @Expose()
  @TransformToDateString()
  public createdAt: string;
}
