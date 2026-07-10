import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

import { CreateGeneration } from "../../_contracts/generation/create-generation.type";

export class CreateGenerationDto implements CreateGeneration {
  @ApiProperty()
  @IsUUID()
  public photoId: string;

  @ApiProperty()
  @IsUUID()
  public hairstyleId: string;
}
