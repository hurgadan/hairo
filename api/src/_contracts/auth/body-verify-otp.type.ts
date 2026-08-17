import { Locale } from "../users/enums/locale.enum";

export interface BodyVerifyOtp {
  email: string;
  /** Шестизначный код из письма. */
  code: string;
  /**
   * Язык, на котором человек проходит регистрацию: именно здесь заводится
   * (или дозаполняется) учётка, и её язык должен совпасть с интерфейсом.
   */
  locale?: Locale;
}
