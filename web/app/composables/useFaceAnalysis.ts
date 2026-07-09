import type { PhotoAnalysis } from "@hurgadan/hairo-contracts";

const POLL_INTERVAL_MS = 1000;
const POLL_TIMEOUT_MS = 30_000;

/** Результат последнего анализа — доступен экрану "Автодетект". */
export function useCurrentAnalysis() {
  return useState<PhotoAnalysis | null>("current-analysis", () => null);
}

export function useFaceAnalysis() {
  const config = useRuntimeConfig();
  const { ensureGuest } = useAuth();
  const current = useCurrentAnalysis();

  async function start(photoId: string): Promise<PhotoAnalysis> {
    const token = await ensureGuest();

    const analysis = await $fetch<PhotoAnalysis>(
      `${config.public.apiBase}/face-analysis`,
      {
        method: "POST",
        body: { photoId },
        headers: { authorization: `Bearer ${token}` },
      },
    );
    current.value = analysis;
    return analysis;
  }

  /** Поллит статус задания до completed/failed либо истечения таймаута. */
  async function poll(id: string): Promise<PhotoAnalysis> {
    const token = await ensureGuest();
    const deadline = Date.now() + POLL_TIMEOUT_MS;

    for (;;) {
      const analysis = await $fetch<PhotoAnalysis>(
        `${config.public.apiBase}/face-analysis/${id}`,
        { headers: { authorization: `Bearer ${token}` } },
      );
      current.value = analysis;

      if (analysis.status !== "pending" || Date.now() > deadline) {
        return analysis;
      }

      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
  }

  return { start, poll, current };
}
