import { ApiBase } from "../api-base";
import { User } from "../users/user.type";
import { AuthResponse } from "./auth-response.type";
import { BodyLogin } from "./body-login.type";
import { BodyRegister } from "./body-register.type";
import { BodyTelegramAuth } from "./body-telegram-auth.type";

export abstract class AuthApi implements ApiBase {
  public readonly baseUrl = "/auth";

  protected abstract guest(): Promise<AuthResponse>;
  protected abstract register(data: BodyRegister): Promise<AuthResponse>;
  protected abstract login(data: BodyLogin): Promise<AuthResponse>;
  protected abstract telegram(data: BodyTelegramAuth): Promise<AuthResponse>;
  protected abstract me(): Promise<User>;
}
