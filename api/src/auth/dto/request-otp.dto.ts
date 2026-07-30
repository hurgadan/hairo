import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsOptional } from "class-validator";

import { BodyRequestOtp } from "../../_contracts/auth/body-request-otp.type";
import { Locale } from "../../_contracts/users/enums/locale.enum";

export class RequestOtpDto implements BodyRequestOtp {
  @ApiProperty()
  @IsEmail()
  public email: string;

  @ApiProperty({ required: false, enum: Locale })
  @IsOptional()
  @IsEnum(Locale)
  public locale?: Locale;
}
