/** Директория с Handlebars-шаблонами сообщений бота относительно модуля. */
export const TEMPLATES_DIR = "templates";

export const START_TEMPLATE = "start.hbs";
export const GENERATION_READY_TEMPLATE = "generation-ready.hbs";

/**
 * Языки Telegram-клиента, которые мы понимаем при первом входе (`language_code`
 * в апдейте). Всё остальное — фолбэк-локаль: перевода интерфейса всё равно нет.
 */
export const TELEGRAM_LANGUAGE_CODES = ["ru", "de", "es"] as const;
