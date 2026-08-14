export interface BodyVerifyOtp {
  email: string;
  /** Шестизначный код из письма. */
  code: string;
}
