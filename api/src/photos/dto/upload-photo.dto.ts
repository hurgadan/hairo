import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { Equals, IsBoolean } from "class-validator";

export class UploadPhotoDto {
  @ApiProperty({
    type: "boolean",
    description: "Явное согласие на обработку фото (GDPR). Обязательно true.",
  })
  // multipart-поля приходят строками — приводим к boolean до валидации
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  @Equals(true, { message: "consent is required" })
  public consent: boolean;
}
