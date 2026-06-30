import { ApiBase } from '../api-base';
import { CreateUser } from './create-user.type';
import { User } from './user.type';

export abstract class UsersApi implements ApiBase {
  public readonly baseUrl = '/users';

  protected abstract createUser(data: CreateUser): Promise<User>;
}
