import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

import { User } from "../../_contracts/users/user.type";

export class UserDto implements User {
  @ApiProperty()
  @Expose()
  public id: string;

  @ApiProperty({ nullable: true })
  @Expose()
  public email: string | null;

  @ApiProperty({ nullable: true })
  @Expose()
  public telegramUsername: string | null;

  @ApiProperty({ nullable: true })
  @Expose()
  public firstName: string | null;

  @ApiProperty({ nullable: true })
  @Expose()
  public lastName: string | null;

  @ApiProperty()
  @Expose()
  public locale: string;
}
