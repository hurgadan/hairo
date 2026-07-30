/** Одновременных SMTP-соединений в пуле (дефолт nodemailer). */
export const SMTP_MAX_CONNECTIONS = 5;

/** Писем на соединение до переподключения (дефолт nodemailer). */
export const SMTP_MAX_MESSAGES = 100;

/** Директория с Handlebars-шаблонами писем относительно этого модуля. */
export const TEMPLATES_DIR = "templates";

export const VERIFICATION_CODE_TEMPLATE = "verification-code";

export const VERIFICATION_CODE_SUBJECT = "Код подтверждения Hairo";
