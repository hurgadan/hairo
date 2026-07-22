export enum CreditTransactionType {
  /** Приветственные кредиты новому аккаунту (trial). */
  SignupBonus = "signup_bonus",
  /** Пополнение баланса покупкой пака (Stripe). */
  Purchase = "purchase",
  /** Списание за генерацию. */
  GenerationDebit = "generation_debit",
  /** Возврат кредита за провалившуюся генерацию. */
  GenerationRefund = "generation_refund",
}
