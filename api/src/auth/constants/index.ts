/** Длина кода подтверждения; 6 цифр — баланс между удобством ввода и перебором. */
export const OTP_CODE_LENGTH = 6;

export const OTP_EXPIRES_IN_MINUTES = 10;

/** Неудачных попыток на код — дальше код сгорает и нужен новый. */
export const OTP_MAX_ATTEMPTS = 5;

/** Пауза между запросами кода на один адрес (антиспам почтового ящика). */
export const OTP_RESEND_AFTER_SECONDS = 60;

/** Окно и лимит запросов с одного IP — чтобы перебор адресов был дорогим. */
export const OTP_IP_WINDOW_MINUTES = 60;
export const OTP_IP_MAX_REQUESTS = 20;
