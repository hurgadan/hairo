import * as crypto from "node:crypto";

export interface TelegramInitDataUser {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
}

/**
 * Собирает валидный `initData` Telegram Mini App с корректной HMAC-подписью —
 * тестовый аналог того, что присылает клиент Telegram.
 */
export function buildTelegramInitData(
  botToken: string,
  user: TelegramInitDataUser,
): string {
  const params = new URLSearchParams();
  params.set("user", JSON.stringify(user));
  params.set("auth_date", Math.floor(Date.now() / 1000).toString());

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  const secret = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();

  params.set(
    "hash",
    crypto.createHmac("sha256", secret).update(dataCheckString).digest("hex"),
  );

  return params.toString();
}
