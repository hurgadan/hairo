import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { transformToDto } from "../../_common/utils/transform-to-dto";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import type { AuthenticatedUser } from "../../auth/types/jwt-payload.type";
import { CreditBalanceDto } from "../dto/credit-balance.dto";
import { CreditTransactionDto } from "../dto/credit-transaction.dto";
import { BillingService } from "../services/billing.service";

@ApiTags("billing")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("billing")
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @Get("balance")
  public async getBalance(
    @CurrentUser() current: AuthenticatedUser,
  ): Promise<CreditBalanceDto> {
    return transformToDto(CreditBalanceDto, {
      balance: await this.billing.getBalance(current.userId),
    });
  }

  @Get("transactions")
  public async getTransactions(
    @CurrentUser() current: AuthenticatedUser,
  ): Promise<CreditTransactionDto[]> {
    const transactions = await this.billing.getTransactions(current.userId);
    return transactions.map((transaction) =>
      transformToDto(CreditTransactionDto, transaction),
    );
  }
}
