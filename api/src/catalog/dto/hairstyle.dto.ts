import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";

import {
  GenderPresentation,
  HairLength,
  HairTexture,
} from "../../_contracts/enums";
import { Aesthetic } from "../../_contracts/catalog/enums/aesthetic.enum";
import { Fringe } from "../../_contracts/catalog/enums/fringe.enum";
import { Maintenance } from "../../_contracts/catalog/enums/maintenance.enum";
import { Occasion } from "../../_contracts/catalog/enums/occasion.enum";
import { Hairstyle } from "../../_contracts/catalog/hairstyle.type";
import { LocalizedText } from "../../_contracts/localized-text.type";

export class HairstyleDto implements Hairstyle {
  @ApiProperty()
  @Expose()
  public id: string;

  @ApiProperty()
  @Expose()
  public slug: string;

  // jsonb — читаем из источника, иначе excludeExtraneousValues рекурсивно вычищает объект
  @ApiProperty({ type: Object })
  @Expose()
  @Transform(({ obj }) => obj.name, { toClassOnly: true })
  public name: LocalizedText;

  @ApiProperty({ type: Object, nullable: true })
  @Expose()
  @Transform(({ obj }) => obj.description, { toClassOnly: true })
  public description: LocalizedText | null;

  @ApiProperty()
  @Expose()
  public groupName: string;

  @ApiProperty({ enum: HairLength })
  @Expose()
  public length: HairLength;

  @ApiProperty({ enum: GenderPresentation })
  @Expose()
  public genderPresentation: GenderPresentation;

  @ApiProperty({ enum: HairTexture, isArray: true })
  @Expose()
  public texture: HairTexture[];

  @ApiProperty({ enum: Fringe, nullable: true })
  @Expose()
  public fringe: Fringe | null;

  @ApiProperty({ enum: Maintenance })
  @Expose()
  public maintenance: Maintenance;

  @ApiProperty({ enum: Aesthetic, isArray: true })
  @Expose()
  public aesthetic: Aesthetic[];

  @ApiProperty({ enum: Occasion, isArray: true })
  @Expose()
  public occasion: Occasion[];

  @ApiProperty({ nullable: true })
  @Expose()
  public previewImage: string | null;

  @ApiProperty({ nullable: true })
  @Expose()
  public matchScore: number | null;
}
