import { CreditTransactionType } from "./enums/transaction-type.enum";

export interface CreditTransaction {
  id: string;
  /** Знаковое изменение баланса: `+` — начисление, `−` — списание. */
  amount: number;
  type: CreditTransactionType;
  createdAt: string;
}
