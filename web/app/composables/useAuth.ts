import type { AuthResponse } from "@hurgadan/hairo-contracts";

const TOKEN_KEY = "hairo-token";

/**
 * Гостевая авторизация (см. PRODUCT.md §4.3): аноним получает identity/JWT
 * лениво — при первом действии, которому нужен аккаунт (напр. загрузка селфи).
 * Токен переживает перезагрузку через localStorage.
 */
export function useAuth() {
  const config = useRuntimeConfig();
  const token = useState<string | null>("auth-token", () => null);

  function loadToken(): string | null {
    if (!token.value && import.meta.client) {
      token.value = localStorage.getItem(TOKEN_KEY);
    }
    return token.value;
  }

  async function ensureGuest(): Promise<string> {
    const existing = loadToken();
    if (existing) return existing;

    const res = await $fetch<AuthResponse>(
      `${config.public.apiBase}/auth/guest`,
      { method: "POST" },
    );
    token.value = res.accessToken;
    if (import.meta.client) {
      localStorage.setItem(TOKEN_KEY, res.accessToken);
    }
    return res.accessToken;
  }

  return { token, loadToken, ensureGuest };
}
