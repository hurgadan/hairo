export interface OtpRequestResult {
  /** Сколько минут код остаётся валидным — фронт показывает это в тексте. */
  expiresInMinutes: number;
  /** Через сколько секунд можно запросить новый код: до этого запрос отдаст 429. */
  resendAfterSeconds: number;
}
