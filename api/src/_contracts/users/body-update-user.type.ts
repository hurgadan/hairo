import { Locale } from "./enums/locale.enum";

export interface BodyUpdateUser {
  /** Язык интерфейса; он же язык писем и уведомлений бота. */
  locale?: Locale;
}
