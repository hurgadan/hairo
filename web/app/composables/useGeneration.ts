import type { Generation } from "@hurgadan/hairo-contracts";

const POLL_INTERVAL_MS = 1500;
// Генерация — 2 вызова image-model подряд (улучшение + рестайлинг), дольше vision-анализа.
const POLL_TIMEOUT_MS = 60_000;

/** Бэкенд вернул 402 — баланс исчерпан, нужен экран пополнения (см. PRODUCT.md §4.2 M3). */
export class InsufficientCreditsError extends Error {
  constructor() {
    super("Insufficient credits");
    this.name = "InsufficientCreditsError";
  }
}

/** Совпадает ли HTTP-статус ошибки `$fetch` (ofetch кладёт его в `statusCode`). */
function isFetchError(e: unknown, status: number): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    (e as { statusCode?: number }).statusCode === status
  );
}

/** Результат последней генерации — доступен экрану "Результат". */
export function useCurrentGeneration() {
  return useState<Generation | null>("current-generation", () => null);
}

export function useGeneration() {
  const config = useRuntimeConfig();
  const { ensureGuest } = useAuth();
  const current = useCurrentGeneration();
  const balance = useBalance();

  async function start(photoId: string, hairstyleId: string): Promise<Generation> {
    const token = await ensureGuest();

    let generation: Generation;
    try {
      generation = await $fetch<Generation>(
        `${config.public.apiBase}/generation`,
        {
          method: "POST",
          body: { photoId, hairstyleId },
          headers: { authorization: `Bearer ${token}` },
        },
      );
    } catch (e) {
      // Недостаточно кредитов — баланс исчерпан, ведём на пополнение.
      if (isFetchError(e, 402)) {
        balance.value = 0;
        throw new InsufficientCreditsError();
      }
      throw e;
    }
    current.value = generation;
    return generation;
  }

  /** Поллит статус задания до completed/failed либо истечения таймаута. */
  async function poll(id: string): Promise<Generation> {
    const token = await ensureGuest();
    const deadline = Date.now() + POLL_TIMEOUT_MS;

    for (;;) {
      const generation = await $fetch<Generation>(
        `${config.public.apiBase}/generation/${id}`,
        { headers: { authorization: `Bearer ${token}` } },
      );
      current.value = generation;

      if (generation.status !== "pending" || Date.now() > deadline) {
        return generation;
      }

      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
  }

  return { start, poll, current };
}
