import { ApiBase } from "../api-base";
import { User } from "../users/user.type";
import { AuthResponse } from "./auth-response.type";
import { BodyLogin } from "./body-login.type";
import { BodyRegister } from "./body-register.type";
import { BodyRequestOtp } from "./body-request-otp.type";
import { BodyTelegramAuth } from "./body-telegram-auth.type";
import { BodyVerifyOtp } from "./body-verify-otp.type";
import { OtpRequestResult } from "./otp-request-result.type";

export abstract class AuthApi implements ApiBase {
  public readonly baseUrl = "/auth";

  protected abstract guest(): Promise<AuthResponse>;
  protected abstract register(data: BodyRegister): Promise<AuthResponse>;
  protected abstract login(data: BodyLogin): Promise<AuthResponse>;
  protected abstract telegram(data: BodyTelegramAuth): Promise<AuthResponse>;
  /** Passwordless-вход, шаг 1: выслать код на email. */
  protected abstract requestOtp(
    data: BodyRequestOtp,
  ): Promise<OtpRequestResult>;
  /**
   * Шаг 2: проверить код и выдать токен. Вызов с гостевым токеном в заголовке
   * присваивает гостевую учётку вместо создания новой (`PRODUCT.md` §4.3).
   */
  protected abstract verifyOtp(data: BodyVerifyOtp): Promise<AuthResponse>;
  protected abstract me(): Promise<User>;
}
