// ВРЕМЕННО: локальная копия контракта авторизации.
// TODO: заменить на импорт из `@hurgadan/hairo-contracts` (см. `photo.ts`).
export interface AuthUser {
  id: string;
  email: string | null;
  telegramUsername: string | null;
  firstName: string | null;
  lastName: string | null;
  locale: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}
