import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

import { BodyTelegramAuth } from "../../_contracts/auth/body-telegram-auth.type";

export class TelegramAuthDto implements BodyTelegramAuth {
  @ApiProperty({ description: "Telegram Mini App initData (raw query string)" })
  @IsString()
  @IsNotEmpty()
  public initData: string;
}
