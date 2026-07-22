import { Injectable } from "@nestjs/common";

import { CreditTransactionType } from "../../_contracts/billing/enums/transaction-type.enum";
import { GENERATION_COST_CREDITS, SIGNUP_BONUS_CREDITS } from "../constants";
import { CreditBalance } from "../dao/credit-balance.entity";
import { CreditTransaction } from "../dao/credit-transaction.entity";
import { InsufficientCreditsException } from "../exceptions/insufficient-credits.exception";
import { BillingRepository } from "../repositories/billing.repository";

@Injectable()
export class BillingService {
  constructor(private readonly repo: BillingRepository) {}

  public async getBalance(userId: string): Promise<CreditBalance["balance"]> {
    return this.repo.getBalance(userId);
  }

  public getTransactions(userId: string): Promise<CreditTransaction[]> {
    return this.repo.findTransactions(userId);
  }

  /** Начисляет приветственные кредиты новому аккаунту (trial). */
  public async grantSignupBonus(userId: string): Promise<void> {
    await this.repo.credit({
      userId,
      amount: SIGNUP_BONUS_CREDITS,
      type: CreditTransactionType.SignupBonus,
    });
  }

  /**
   * Списывает кредит(ы) за генерацию. Бросает {@link InsufficientCreditsException}
   * (HTTP 402), если баланса не хватает. Дебет вызывается до создания задания,
   * поэтому `generationId` ещё нет — леджер-строка дебета остаётся без привязки.
   */
  public async debitForGeneration(userId: string): Promise<void> {
    const ok = await this.repo.debit({
      userId,
      amount: GENERATION_COST_CREDITS,
      type: CreditTransactionType.GenerationDebit,
    });

    if (!ok) {
      throw new InsufficientCreditsException();
    }
  }

  /** Возвращает кредит(ы) за провалившуюся/несозданную генерацию. */
  public async refundForGeneration(
    userId: string,
    generationId?: string,
  ): Promise<void> {
    await this.repo.credit({
      userId,
      amount: GENERATION_COST_CREDITS,
      type: CreditTransactionType.GenerationRefund,
      generationId: generationId ?? null,
    });
  }
}
