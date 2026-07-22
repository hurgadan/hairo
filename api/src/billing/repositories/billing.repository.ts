import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MoreThanOrEqual, Repository } from "typeorm";

import { CreditTransactionType } from "../../_contracts/billing/enums/transaction-type.enum";
import { CreditBalance } from "../dao/credit-balance.entity";
import { CreditTransaction } from "../dao/credit-transaction.entity";

export interface DebitEntry {
  userId: string;
  amount: number;
  type: CreditTransactionType;
  reason?: string | null;
  generationId?: string | null;
}

export interface CreditEntry {
  userId: string;
  amount: number;
  type: CreditTransactionType;
  reason?: string | null;
  generationId?: string | null;
  /** Если задан — начисление идемпотентно: повторный event не дублирует кредиты. */
  stripeEventId?: string | null;
}

@Injectable()
export class BillingRepository {
  constructor(
    @InjectRepository(CreditBalance)
    private readonly balances: Repository<CreditBalance>,
    @InjectRepository(CreditTransaction)
    private readonly transactions: Repository<CreditTransaction>,
  ) {}

  public async getBalance(userId: string): Promise<number> {
    const row = await this.balances.findOne({ where: { userId } });
    return row?.balance ?? 0;
  }

  public findTransactions(userId: string): Promise<CreditTransaction[]> {
    return this.transactions.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });
  }

  /**
   * Атомарное списание: единственным условным UPDATE списывает `amount`,
   * только если баланса достаточно. Возвращает `false`, если не хватило
   * (баланс не тронут, леджер не пишется). Дебет + запись леджера — в транзакции.
   */
  public async debit(entry: DebitEntry): Promise<boolean> {
    return this.balances.manager.transaction(async (manager) => {
      const result = await manager.decrement(
        CreditBalance,
        { userId: entry.userId, balance: MoreThanOrEqual(entry.amount) },
        "balance",
        entry.amount,
      );

      if (result.affected !== 1) {
        return false;
      }

      await manager.insert(CreditTransaction, {
        userId: entry.userId,
        amount: -entry.amount,
        type: entry.type,
        reason: entry.reason ?? null,
        generationId: entry.generationId ?? null,
      });

      return true;
    });
  }

  /**
   * Начисление (bonus/refund/purchase). Идемпотентно по `stripeEventId`:
   * если событие уже зачтено — no-op. Баланс апсертится под блокировкой строки.
   */
  public async credit(entry: CreditEntry): Promise<void> {
    await this.balances.manager.transaction(async (manager) => {
      if (entry.stripeEventId) {
        const already = await manager.findOne(CreditTransaction, {
          where: { stripeEventId: entry.stripeEventId },
        });
        if (already) {
          return;
        }
      }

      const existing = await manager.findOne(CreditBalance, {
        where: { userId: entry.userId },
        lock: { mode: "pessimistic_write" },
      });

      if (existing) {
        await manager.increment(
          CreditBalance,
          { userId: entry.userId },
          "balance",
          entry.amount,
        );
      } else {
        await manager.insert(CreditBalance, {
          userId: entry.userId,
          balance: entry.amount,
        });
      }

      await manager.insert(CreditTransaction, {
        userId: entry.userId,
        amount: entry.amount,
        type: entry.type,
        reason: entry.reason ?? null,
        generationId: entry.generationId ?? null,
        stripeEventId: entry.stripeEventId ?? null,
      });
    });
  }
}
