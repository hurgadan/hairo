import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

import type { AppConfig } from "../../_common/types";
import { User } from "../../users/dao/user.entity";
import { UsersService } from "../../users/services/users.service";
import type { LoginDto } from "../dto/login.dto";
import type { RegisterDto } from "../dto/register.dto";
import type { JwtPayload } from "../types/jwt-payload.type";
import { verifyTelegramInitData } from "../utils/verify-telegram-init-data";

const BCRYPT_ROUNDS = 10;

export interface AuthResult {
  accessToken: string;
  user: User;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  public async register(dto: RegisterDto): Promise<AuthResult> {
    const existing = await this.users.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException("Email already registered");
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.users.createEmailUser({
      email: dto.email,
      passwordHash,
      locale: dto.locale,
    });

    return this.buildResult(user);
  }

  public async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.users.findByEmail(dto.email);
    if (!user?.passwordHash) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return this.buildResult(user);
  }

  public async loginWithTelegram(initData: string): Promise<AuthResult> {
    const botToken = this.configService.get("telegramBotToken", {
      infer: true,
    });

    let tgUser;
    try {
      tgUser = verifyTelegramInitData(initData, botToken);
    } catch {
      throw new UnauthorizedException("Invalid Telegram initData");
    }

    const user = await this.users.upsertTelegramUser({
      telegramId: String(tgUser.id),
      telegramUsername: tgUser.username ?? null,
      firstName: tgUser.first_name ?? null,
      lastName: tgUser.last_name ?? null,
    });

    return this.buildResult(user);
  }

  private buildResult(user: User): AuthResult {
    const payload: JwtPayload = { sub: user.id };
    return { accessToken: this.jwt.sign(payload), user };
  }
}
