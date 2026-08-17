import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsEnum,
  IsNumberString,
  IsOptional,
  Length,
} from "class-validator";

import { BodyVerifyOtp } from "../../_contracts/auth/body-verify-otp.type";
import { Locale } from "../../_contracts/users/enums/locale.enum";
import { OTP_CODE_LENGTH } from "../constants";

export class VerifyOtpDto implements BodyVerifyOtp {
  @ApiProperty()
  @IsEmail()
  public email: string;

  @ApiProperty({ minLength: OTP_CODE_LENGTH, maxLength: OTP_CODE_LENGTH })
  @IsNumberString()
  @Length(OTP_CODE_LENGTH, OTP_CODE_LENGTH)
  public code: string;

  @ApiProperty({ required: false, enum: Locale })
  @IsOptional()
  @IsEnum(Locale)
  public locale?: Locale;
}
