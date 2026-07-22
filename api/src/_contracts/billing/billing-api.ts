import { ApiBase } from "../api-base";
import { CreditBalance } from "./credit-balance.type";
import { CreditTransaction } from "./credit-transaction.type";

export abstract class BillingApi implements ApiBase {
  public readonly baseUrl = "/billing";

  protected abstract getBalance(): Promise<CreditBalance>;
  protected abstract getTransactions(): Promise<CreditTransaction[]>;
}
