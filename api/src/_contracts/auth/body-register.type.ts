import { Locale } from "../users/enums/locale.enum";

export interface BodyRegister {
  email: string;
  password: string;
  locale?: Locale;
}
