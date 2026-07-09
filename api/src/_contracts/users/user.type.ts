import { Locale } from "./enums/locale.enum";

export interface User {
  id: string;
  email: string | null;
  telegramUsername: string | null;
  firstName: string | null;
  lastName: string | null;
  locale: Locale;
}
