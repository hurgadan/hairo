import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

import { Locale } from "../../_contracts/users/enums/locale.enum";
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

  @ApiProperty({ enum: Locale })
  @Expose()
  public locale: Locale;
}
