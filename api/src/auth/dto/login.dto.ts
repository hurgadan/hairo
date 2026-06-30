import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

import { BodyLogin } from "../../_contracts/auth/body-login.type";

export class LoginDto implements BodyLogin {
  @ApiProperty()
  @IsEmail()
  public email: string;

  @ApiProperty()
  @IsNotEmpty()
  public password: string;
}
