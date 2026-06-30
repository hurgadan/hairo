import { Injectable } from "@nestjs/common";

import { User } from "../dao/user.entity";
import { UsersRepository } from "../repositories/users.repository";

export interface CreateEmailUserData {
  email: string;
  passwordHash: string;
  locale?: string;
}

export interface TelegramUserData {
  telegramId: string;
  telegramUsername?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  locale?: string;
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

  public createEmailUser(data: CreateEmailUserData): Promise<User> {
    return this.repo.save({
      email: data.email,
      passwordHash: data.passwordHash,
      locale: data.locale ?? "ru",
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
      locale: existing?.locale ?? data.locale ?? "ru",
    });
  }
}
