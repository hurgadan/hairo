import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsArray, IsEnum, IsOptional } from "class-validator";

import {
  FaceShape,
  GenderPresentation,
  HairDensity,
  HairLength,
  HairTexture,
} from "../../_contracts/enums";
import { Maintenance } from "../../_contracts/catalog/enums/maintenance.enum";
import { Occasion } from "../../_contracts/catalog/enums/occasion.enum";
import { HairstyleFilter } from "../../_contracts/catalog/hairstyle-filter.type";

const toArray = ({ value }: { value: unknown }): unknown =>
  value === undefined ? undefined : Array.isArray(value) ? value : [value];

export class ListHairstylesQueryDto implements HairstyleFilter {
  @ApiPropertyOptional({ enum: GenderPresentation })
  @IsOptional()
  @IsEnum(GenderPresentation)
  public gender?: GenderPresentation;

  @ApiPropertyOptional({ enum: HairLength })
  @IsOptional()
  @IsEnum(HairLength)
  public length?: HairLength;

  @ApiPropertyOptional({ enum: Maintenance })
  @IsOptional()
  @IsEnum(Maintenance)
  public maintenance?: Maintenance;

  @ApiPropertyOptional({ enum: FaceShape })
  @IsOptional()
  @IsEnum(FaceShape)
  public faceShape?: FaceShape;

  @ApiPropertyOptional({ enum: HairTexture, isArray: true })
  @IsOptional()
  @Transform(toArray)
  @IsArray()
  @IsEnum(HairTexture, { each: true })
  public texture?: HairTexture[];

  @ApiPropertyOptional({ enum: HairDensity })
  @IsOptional()
  @IsEnum(HairDensity)
  public density?: HairDensity;

  @ApiPropertyOptional({ enum: Occasion, isArray: true })
  @IsOptional()
  @Transform(toArray)
  @IsArray()
  @IsEnum(Occasion, { each: true })
  public occasion?: Occasion[];
}
