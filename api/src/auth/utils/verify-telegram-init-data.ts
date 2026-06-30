import * as crypto from "node:crypto";

export interface TelegramInitUser {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
}

/**
 * Проверяет подпись Telegram Mini App initData и возвращает пользователя.
 * Алгоритм: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 * Бросает Error при невалидной/просроченной подписи.
 */
export function verifyTelegramInitData(
  initData: string,
  botToken: string,
  maxAgeSec = 86400,
): TelegramInitUser {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) {
    throw new Error("initData: hash is missing");
  }
  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();
  const computedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (computedHash !== hash) {
    throw new Error("initData: invalid signature");
  }

  const authDate = Number(params.get("auth_date"));
  if (maxAgeSec && authDate && Date.now() / 1000 - authDate > maxAgeSec) {
    throw new Error("initData: expired");
  }

  const userRaw = params.get("user");
  if (!userRaw) {
    throw new Error("initData: user is missing");
  }

  return JSON.parse(userRaw) as TelegramInitUser;
}
