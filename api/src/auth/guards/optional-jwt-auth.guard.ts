import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import type { AuthenticatedUser } from "../types/jwt-payload.type";

/**
 * Пропускает запрос и без токена. Нужен там, где вход возможен и гостем, и
 * анонимно: верификация кода с гостевым токеном присваивает гостевую учётку,
 * без токена — заводит новую (`PRODUCT.md` §4.3). Невалидный или протухший
 * токен тоже не роняет запрос — трактуем как «гостя нет».
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard("jwt") {
  public handleRequest<TUser = AuthenticatedUser>(
    _err: unknown,
    user: TUser | false,
  ): TUser | undefined {
    return user || undefined;
  }
}
