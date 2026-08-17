import { ApiBase } from "../api-base";
import { BodyUpdateUser } from "./body-update-user.type";
import { User } from "./user.type";

export abstract class UsersApi implements ApiBase {
  public readonly baseUrl = "/users";

  /**
   * Правка своего профиля. Пока это только язык: выбор в интерфейсе должен
   * пережить смену устройства и дойти до писем, которые уходят без открытой
   * вкладки (`ROADMAP.md`, Фаза 5).
   */
  protected abstract updateMe(data: BodyUpdateUser): Promise<User>;
}
