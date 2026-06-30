import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsIn, IsOptional, MinLength } from "class-validator";

import { BodyRegister } from "../../_contracts/auth/body-register.type";

export class RegisterDto implements BodyRegister {
  @ApiProperty()
  @IsEmail()
  public email: string;

  @ApiProperty({ minLength: 8 })
  @MinLength(8)
  public password: string;

  @ApiProperty({ required: false, enum: ["ru", "es", "de"] })
  @IsOptional()
  @IsIn(["ru", "es", "de"])
  public locale?: string;
}
