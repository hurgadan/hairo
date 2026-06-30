import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";

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

  @ApiProperty()
  @Expose()
  public length: string;

  @ApiProperty()
  @Expose()
  public genderPresentation: string;

  @ApiProperty({ type: [String] })
  @Expose()
  public texture: string[];

  @ApiProperty({ nullable: true })
  @Expose()
  public fringe: string | null;

  @ApiProperty()
  @Expose()
  public maintenance: string;

  @ApiProperty({ type: [String] })
  @Expose()
  public aesthetic: string[];

  @ApiProperty({ type: [String] })
  @Expose()
  public occasion: string[];

  @ApiProperty({ nullable: true })
  @Expose()
  public previewImage: string | null;
}
