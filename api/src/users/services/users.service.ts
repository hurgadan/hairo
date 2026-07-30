import { Injectable } from "@nestjs/common";

import { Locale } from "../../_contracts/users/enums/locale.enum";
import { User } from "../dao/user.entity";
import { UsersRepository } from "../repositories/users.repository";

export interface CreateEmailUserData {
  email: string;
  /** Пуст для passwordless-регистрации по коду — пароля у такой учётки нет. */
  passwordHash?: string | null;
  locale?: Locale;
}

export interface TelegramUserData {
  telegramId: string;
  telegramUsername?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  locale?: Locale;
}

export interface UpsertTelegramUserResult {
  user: User;
  /** `true` — аккаунт заведён этим вызовом (первый вход), `false` — уже существовал. */
  created: boolean;
}

@Injectable()
export class UsersService {
  constructor(private readonly repo: UsersRepository) {}

  public findById(id: string): Promise<User | null> {
    return this.repo.findById(id);
  }

  public findByEmail(email: string): Promise<User | null> {
    return this.repo.findByEmail(email);
  }

  /** Анонимный пользователь (без email/telegram) — гостевая сессия до регистрации. */
  public createGuest(locale?: Locale): Promise<User> {
    return this.repo.save({ locale: locale ?? Locale.Ru });
  }

  public createEmailUser(data: CreateEmailUserData): Promise<User> {
    return this.repo.save({
      email: data.email,
      passwordHash: data.passwordHash ?? null,
      locale: data.locale ?? Locale.Ru,
    });
  }

  /**
   * Присваивает гостевой учётке email — регистрация не заводит новую строку,
   * а дозаполняет текущую, поэтому фото и примерки гостя остаются при нём
   * (`PRODUCT.md` §4.3).
   */
  public attachEmail(
    user: User,
    email: string,
    locale?: Locale,
  ): Promise<User> {
    return this.repo.save({
      ...user,
      email,
      locale: locale ?? user.locale,
    });
  }

  /** Гость — учётка без email и без Telegram, заведённая `POST /auth/guest`. */
  public isGuest(user: User): boolean {
    return !user.email && !user.telegramId;
  }

  public mergeGuestInto(guestId: string, targetUserId: string): Promise<void> {
    return this.repo.mergeGuestInto(guestId, targetUserId);
  }

  /**
   * Заводит или обновляет Telegram-аккаунт. `created` отличает первый вход от
   * повторного — по нему начисляется trial (иначе бонус капал бы каждый вход).
   */
  public async upsertTelegramUser(
    data: TelegramUserData,
  ): Promise<UpsertTelegramUserResult> {
    const existing = await this.repo.findByTelegramId(data.telegramId);

    const user = await this.repo.save({
      ...(existing ?? {}),
      telegramId: data.telegramId,
      telegramUsername: data.telegramUsername ?? null,
      firstName: data.firstName ?? null,
      lastName: data.lastName ?? null,
      locale: existing?.locale ?? data.locale ?? Locale.Ru,
    });

    return { user, created: !existing };
  }

  public touchActivity(id: string): Promise<void> {
    return this.repo.touchActivity(id);
  }

  public findInactiveSince(cutoff: Date): Promise<User[]> {
    return this.repo.findInactiveSince(cutoff);
  }
}
