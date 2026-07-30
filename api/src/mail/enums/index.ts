export enum MailProvider {
  /** Письмо печатается в лог вместо отправки — dev/test без SMTP-сервера. */
  Log = "log",
  /** SMTP-релей: локально Mailpit/MailHog, в прод — Mailgun/Postmark/Resend. */
  Smtp = "smtp",
}
