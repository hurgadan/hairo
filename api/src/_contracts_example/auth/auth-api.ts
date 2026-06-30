import { ApiBase } from '../api-base';
import { BodyLogin } from './body-login.type';
import { Login } from './login.type';

export abstract class AuthApi implements ApiBase {
  public readonly baseUrl = '/auth';

  protected abstract login(data: BodyLogin): Promise<Login>;
  protected abstract logout(): Promise<void>;
}
