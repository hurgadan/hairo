import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsOptional, MinLength } from "class-validator";

import { Locale } from "../../_contracts/users/enums/locale.enum";
import { BodyRegister } from "../../_contracts/auth/body-register.type";

export class RegisterDto implements BodyRegister {
  @ApiProperty()
  @IsEmail()
  public email: string;

  @ApiProperty({ minLength: 8 })
  @MinLength(8)
  public password: string;

  @ApiProperty({ required: false, enum: Locale })
  @IsOptional()
  @IsEnum(Locale)
  public locale?: Locale;
}
