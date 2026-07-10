import type { Generation } from "@hurgadan/hairo-contracts";

const POLL_INTERVAL_MS = 1500;
// Генерация — 2 вызова image-model подряд (улучшение + рестайлинг), дольше vision-анализа.
const POLL_TIMEOUT_MS = 60_000;

/** Результат последней генерации — доступен экрану "Результат". */
export function useCurrentGeneration() {
  return useState<Generation | null>("current-generation", () => null);
}

export function useGeneration() {
  const config = useRuntimeConfig();
  const { ensureGuest } = useAuth();
  const current = useCurrentGeneration();

  async function start(photoId: string, hairstyleId: string): Promise<Generation> {
    const token = await ensureGuest();

    const generation = await $fetch<Generation>(
      `${config.public.apiBase}/generation`,
      {
        method: "POST",
        body: { photoId, hairstyleId },
        headers: { authorization: `Bearer ${token}` },
      },
    );
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
