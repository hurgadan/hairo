import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThan, Repository } from "typeorm";

import { Generation } from "../../generation/dao/generation.entity";
import { PhotoAnalysis } from "../../face-analysis/dao/photo-analysis.entity";
import { Photo } from "../../photos/dao/photo.entity";
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

  /**
   * Переносит всё нажитое гостем на существующий аккаунт и удаляет гостевую
   * учётку — сценарий «вошёл по коду, а этот email уже зарегистрирован»
   * (`PRODUCT.md` §4.6). Баланс переносить не нужно: гостю кредиты не
   * начисляются, так что леджер у него пуст (см. `ROADMAP.md`, Фаза 4).
   *
   * Живёт в репозитории, а не в сервисе: это доступ к данным, и он обязан быть
   * атомарным — иначе половина фото останется на удалённом госте.
   */
  public async mergeGuestInto(
    guestId: string,
    targetUserId: string,
  ): Promise<void> {
    await this.users.manager.transaction(async (manager) => {
      for (const entity of [Photo, PhotoAnalysis, Generation]) {
        await manager.update(
          entity,
          { userId: guestId },
          { userId: targetUserId },
        );
      }

      await manager.delete(User, { id: guestId });
    });
  }
}
