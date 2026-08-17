import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";

import { BodyUpdateUser } from "../../_contracts/users/body-update-user.type";
import { Locale } from "../../_contracts/users/enums/locale.enum";

export class UpdateUserDto implements BodyUpdateUser {
  @ApiProperty({ required: false, enum: Locale })
  @IsOptional()
  @IsEnum(Locale)
  public locale?: Locale;
}
