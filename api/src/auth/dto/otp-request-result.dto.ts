import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

import { OtpRequestResult } from "../../_contracts/auth/otp-request-result.type";

export class OtpRequestResultDto implements OtpRequestResult {
  @ApiProperty()
  @Expose()
  public expiresInMinutes: number;

  @ApiProperty()
  @Expose()
  public resendAfterSeconds: number;
}
