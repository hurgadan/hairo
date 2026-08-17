/**
 * Ошибка `$fetch`: ofetch кладёт HTTP-статус в `statusCode`, а тело ответа —
 * в `data` (оттуда достаём поля вроде `retryAfterSeconds`).
 */
interface FetchErrorLike {
  statusCode: number;
  data?: unknown;
}

/** Совпадает ли статус ошибки `$fetch` с ожидаемым. */
export function isFetchError(e: unknown, status: number): e is FetchErrorLike {
  return (
    typeof e === "object" &&
    e !== null &&
    (e as { statusCode?: number }).statusCode === status
  );
}

/** Числовое поле из тела ошибки; `fallback` — если тело не то, что ожидали. */
export function fetchErrorNumber(
  e: FetchErrorLike,
  field: string,
  fallback: number,
): number {
  const value = (e.data as Record<string, unknown> | undefined)?.[field];
  return typeof value === "number" ? value : fallback;
}
