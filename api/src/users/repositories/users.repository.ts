import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThan, Repository } from "typeorm";

import { User } from "../dao/user.entity";

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  public findById(id: string): Promise<User | null> {
    return this.users.findOne({ where: { id } });
  }

  public findByEmail(email: string): Promise<User | null> {
    return this.users.findOne({ where: { email } });
  }

  public findByTelegramId(telegramId: string): Promise<User | null> {
    return this.users.findOne({ where: { telegramId } });
  }

  public save(data: Partial<User>): Promise<User> {
    return this.users.save(this.users.create(data));
  }

  public async touchActivity(id: string): Promise<void> {
    await this.users.update({ id }, { lastActiveAt: new Date() });
  }

  /** Пользователи без активности с `cutoff` — кандидаты на GDPR-удаление фото. */
  public findInactiveSince(cutoff: Date): Promise<User[]> {
    return this.users.find({ where: { lastActiveAt: LessThan(cutoff) } });
  }
}
