import type { CreditBalance, CreditTransaction } from "@hurgadan/hairo-contracts";

/** Текущий баланс кредитов («примерок») — общий на приложение, чтобы индикатор
 * в разных местах не расходился. `null` — ещё не загружен. */
export function useBalance() {
  return useState<number | null>("credit-balance", () => null);
}

export function useBilling() {
  const config = useRuntimeConfig();
  const { ensureGuest } = useAuth();
  const balance = useBalance();

  async function fetchBalance(): Promise<number> {
    const token = await ensureGuest();
    const res = await $fetch<CreditBalance>(
      `${config.public.apiBase}/billing/balance`,
      { headers: { authorization: `Bearer ${token}` } },
    );
    balance.value = res.balance;
    return res.balance;
  }

  async function fetchTransactions(): Promise<CreditTransaction[]> {
    const token = await ensureGuest();
    return $fetch<CreditTransaction[]>(
      `${config.public.apiBase}/billing/transactions`,
      { headers: { authorization: `Bearer ${token}` } },
    );
  }

  return { balance, fetchBalance, fetchTransactions };
}
