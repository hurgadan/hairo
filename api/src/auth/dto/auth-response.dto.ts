import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";

import { AuthResponse } from "../../_contracts/auth/auth-response.type";
import { UserDto } from "../../users/dto/user.dto";

export class AuthResponseDto implements AuthResponse {
  @ApiProperty()
  @Expose()
  public accessToken: string;

  @ApiProperty({ type: UserDto })
  @Expose()
  @Type(() => UserDto)
  public user: UserDto;
}
