import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

import { BodyStartAnalysis } from "../../_contracts/face-analysis/body-start-analysis.type";

export class StartFaceAnalysisDto implements BodyStartAnalysis {
  @ApiProperty()
  @IsUUID()
  public photoId: string;
}
