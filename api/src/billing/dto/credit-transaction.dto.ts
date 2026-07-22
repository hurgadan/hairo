import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

import { TransformToDateString } from "../../_common/utils/decorators/transform-to-date-string.decorator";
import { CreditTransaction } from "../../_contracts/billing/credit-transaction.type";
import { CreditTransactionType } from "../../_contracts/billing/enums/transaction-type.enum";

export class CreditTransactionDto implements CreditTransaction {
  @ApiProperty()
  @Expose()
  public id: string;

  @ApiProperty()
  @Expose()
  public amount: number;

  @ApiProperty({ enum: CreditTransactionType })
  @Expose()
  public type: CreditTransactionType;

  @ApiProperty()
  @Expose()
  @TransformToDateString()
  public createdAt: string;
}
