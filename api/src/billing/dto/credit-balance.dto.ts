import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

import { CreditBalance } from "../../_contracts/billing/credit-balance.type";

export class CreditBalanceDto implements CreditBalance {
  @ApiProperty()
  @Expose()
  public balance: number;
}
