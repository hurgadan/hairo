import { Injectable } from "@nestjs/common";

import { Locale } from "../../_contracts/users/enums/locale.enum";
import { User } from "../dao/user.entity";
import { UsersRepository } from "../repositories/users.repository";

export interface CreateEmailUserData {
  email: string;
  passwordHash: string;
  locale?: Locale;
}

export interface TelegramUserData {
  telegramId: string;
  telegramUsername?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  locale?: Locale;
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
      passwordHash: data.passwordHash,
      locale: data.locale ?? Locale.Ru,
    });
  }

  public async upsertTelegramUser(data: TelegramUserData): Promise<User> {
    const existing = await this.repo.findByTelegramId(data.telegramId);

    return this.repo.save({
      ...(existing ?? {}),
      telegramId: data.telegramId,
      telegramUsername: data.telegramUsername ?? null,
      firstName: data.firstName ?? null,
      lastName: data.lastName ?? null,
      locale: existing?.locale ?? data.locale ?? Locale.Ru,
    });
  }

  public touchActivity(id: string): Promise<void> {
    return this.repo.touchActivity(id);
  }

  public findInactiveSince(cutoff: Date): Promise<User[]> {
    return this.repo.findInactiveSince(cutoff);
  }
}
