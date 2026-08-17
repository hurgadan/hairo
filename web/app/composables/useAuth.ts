import type {
  AuthResponse,
  OtpRequestResult,
  User,
} from "@hurgadan/hairo-contracts";

const TOKEN_KEY = "hairo-token";

/** Ретраить запрос кода можно не раньше, чем через `retryAfterSeconds` (HTTP 429). */
export class OtpRateLimitError extends Error {
  constructor(public readonly retryAfterSeconds: number) {
    super("Too many verification code requests");
    this.name = "OtpRateLimitError";
  }
}

/**
 * Код не подошёл. Бэкенд намеренно отвечает одинаковым 401 на неверный,
 * просроченный, сожжённый и никогда не выдававшийся код — различать нечего.
 */
export class InvalidOtpError extends Error {
  constructor() {
    super("Invalid verification code");
    this.name = "InvalidOtpError";
  }
}

/** Текущий пользователь — общий на приложение; `null` — гость либо ещё не загружен. */
function useCurrentUser() {
  return useState<User | null>("auth-user", () => null);
}

/**
 * Гостевая авторизация (см. PRODUCT.md §4.3): аноним получает identity/JWT
 * лениво — при первом действии, которому нужен аккаунт (напр. загрузка селфи).
 * Токен переживает перезагрузку через localStorage.
 *
 * Апгрейд гостя до полного аккаунта — passwordless: email + код из письма.
 * Верификация с гостевым токеном присваивает текущую учётку (тот же `user.id`,
 * фото и примерки сохраняются), без токена — заводит новую.
 */
export function useAuth() {
  const config = useRuntimeConfig();
  const token = useState<string | null>("auth-token", () => null);
  const user = useCurrentUser();

  /** Гость — учётка без email и Telegram: путь до генерации открыт, генерация нет. */
  const isRegistered = computed(
    () => Boolean(user.value?.email) || Boolean(user.value?.telegramUsername),
  );

  function loadToken(): string | null {
    if (!token.value && import.meta.client) {
      token.value = localStorage.getItem(TOKEN_KEY);
    }
    return token.value;
  }

  function setToken(value: string | null): void {
    token.value = value;
    if (!import.meta.client) return;
    if (value) {
      localStorage.setItem(TOKEN_KEY, value);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  async function ensureGuest(): Promise<string> {
    const existing = loadToken();
    if (existing) return existing;

    const res = await $fetch<AuthResponse>(
      `${config.public.apiBase}/auth/guest`,
      { method: "POST" },
    );
    setToken(res.accessToken);
    user.value = res.user;
    return res.accessToken;
  }

  /**
   * Кто мы сейчас — из состояния, иначе по токену с бэка. Гостя не заводит:
   * без токена возвращает `null` (мы ещё ничего не делали, аккаунт не нужен).
   */
  async function ensureUser(): Promise<User | null> {
    if (user.value) return user.value;

    const existing = loadToken();
    if (!existing) return null;

    try {
      user.value = await $fetch<User>(`${config.public.apiBase}/auth/me`, {
        headers: { authorization: `Bearer ${existing}` },
      });
    } catch (e) {
      // Токен протух или подписан другим ключом — выбрасываем, дальше заведётся новый.
      if (isFetchError(e, 401)) setToken(null);
      return null;
    }
    return user.value;
  }

  /**
   * Шаг 1: выслать код на email. Ответ одинаков для известного и неизвестного
   * адреса, так что «зарегистрирован ли этот email» отсюда не узнать.
   * Локаль письма не передаём — до Фазы 5 (i18n) бэкенд по умолчанию шлёт RU.
   */
  async function requestOtp(email: string): Promise<OtpRequestResult> {
    try {
      return await $fetch<OtpRequestResult>(
        `${config.public.apiBase}/auth/otp/request`,
        { method: "POST", body: { email } },
      );
    } catch (e) {
      if (isFetchError(e, 429)) {
        throw new OtpRateLimitError(fetchErrorNumber(e, "retryAfterSeconds", 60));
      }
      throw e;
    }
  }

  /**
   * Шаг 2: проверить код и получить постоянный токен. Гостевой токен передаём,
   * если он есть: тогда учётка дозаполняется, а не создаётся заново.
   */
  async function verifyOtp(email: string, code: string): Promise<User> {
    const guestToken = loadToken();

    let res: AuthResponse;
    try {
      res = await $fetch<AuthResponse>(
        `${config.public.apiBase}/auth/otp/verify`,
        {
          method: "POST",
          body: { email, code },
          headers: guestToken ? { authorization: `Bearer ${guestToken}` } : {},
        },
      );
    } catch (e) {
      if (isFetchError(e, 401)) throw new InvalidOtpError();
      throw e;
    }

    setToken(res.accessToken);
    user.value = res.user;
    return res.user;
  }

  return {
    token,
    user,
    isRegistered,
    loadToken,
    ensureGuest,
    ensureUser,
    requestOtp,
    verifyOtp,
  };
}
