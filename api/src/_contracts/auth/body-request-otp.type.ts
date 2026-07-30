import { Locale } from "../users/enums/locale.enum";

export interface BodyRequestOtp {
  email: string;
  /** Язык письма и заводимой учётки; по умолчанию — RU. */
  locale?: Locale;
}
