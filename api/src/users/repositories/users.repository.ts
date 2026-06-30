import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

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
}
