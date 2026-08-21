import { Locale } from "../../_contracts/users/enums/locale.enum";

/** Одновременных SMTP-соединений в пуле (дефолт nodemailer). */
export const SMTP_MAX_CONNECTIONS = 5;

/** Писем на соединение до переподключения (дефолт nodemailer). */
export const SMTP_MAX_MESSAGES = 100;

/** Директория с Handlebars-шаблонами писем относительно этого модуля. */
export const TEMPLATES_DIR = "templates";

export const VERIFICATION_CODE_TEMPLATE = "verification-code";

/** Тема письма — единственный текст письма вне шаблона, поэтому живёт здесь. */
export const VERIFICATION_CODE_SUBJECT: Record<Locale, string> = {
  [Locale.Ru]: "Код подтверждения Hairo",
  [Locale.De]: "Hairo-Bestätigungscode",
  [Locale.Es]: "Código de verificación de Hairo",
};
