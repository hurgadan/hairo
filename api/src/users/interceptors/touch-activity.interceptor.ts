import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";

import type { AuthenticatedUser } from "../../auth/types/jwt-payload.type";
import { UsersService } from "../services/users.service";

/**
 * Глобальный интерцептор: на каждый аутентифицированный запрос обновляет
 * `User.lastActiveAt` — основа для GDPR-удаления по сроку неактивности
 * (`retention`-модуль). Fire-and-forget, не блокирует и не может уронить запрос.
 */
@Injectable()
export class TouchActivityInterceptor implements NestInterceptor {
  constructor(private readonly users: UsersService) {}

  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const user: AuthenticatedUser | undefined = request.user;

    if (user?.userId) {
      this.users.touchActivity(user.userId).catch(() => {});
    }

    return next.handle();
  }
}
