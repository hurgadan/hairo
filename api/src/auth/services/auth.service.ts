import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

import type { AppConfig } from "../../_common/types";
import { Locale } from "../../_contracts/users/enums/locale.enum";
import { BillingService } from "../../billing/services/billing.service";
import { User } from "../../users/dao/user.entity";
import {
  TelegramUserData,
  UsersService,
} from "../../users/services/users.service";
import type { LoginDto } from "../dto/login.dto";
import type { RegisterDto } from "../dto/register.dto";
import type { JwtPayload } from "../types/jwt-payload.type";
import { verifyTelegramInitData } from "../utils/verify-telegram-init-data";

const BCRYPT_ROUNDS = 10;

export interface AuthResult {
  accessToken: string;
  user: User;
}

export interface OtpLoginParams {
  email: string;
  locale?: Locale;
  /** Владелец гостевого токена, если запрос пришёл с ним, — кандидат на линковку. */
  currentUserId?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly billing: BillingService,
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
    await this.billing.grantSignupBonus(user.id);

    return this.buildResult(user);
  }

  /**
   * Гостевая сессия — identity без кредитов: trial начисляется только при
   * регистрации (`PRODUCT.md` §4.2). Иначе бесплатный тир абьюзится в один
   * запрос — новая гостевая сессия давала бы новую бесплатную генерацию.
   */
  public async loginAsGuest(): Promise<AuthResult> {
    const user = await this.users.createGuest();
    return this.buildResult(user);
  }

  /**
   * Passwordless-вход: код уже проверен, осталось решить, чей это аккаунт.
   * Четыре случая (`PRODUCT.md` §4.3, §4.6):
   *
   * 1. гость + свободный email → присваиваем гостевую учётку, начисляем trial;
   * 2. гость + занятый email → это вход в существующий аккаунт, наработки
   *    гостя переносим туда же, гостя удаляем (бонус не начисляем — аккаунт
   *    не новый);
   * 3. без гостя + свободный email → заводим учётку, начисляем trial;
   * 4. без гостя + занятый email → обычный вход.
   */
  public async loginWithOtp(param: OtpLoginParams): Promise<AuthResult> {
    const email = param.email.trim().toLowerCase();
    const existing = await this.users.findByEmail(email);
    const current = param.currentUserId
      ? await this.users.findById(param.currentUserId)
      : null;
    const guest = current && this.users.isGuest(current) ? current : null;

    if (existing) {
      if (guest && guest.id !== existing.id) {
        await this.users.mergeGuestInto(guest.id, existing.id);
      }
      return this.buildResult(existing);
    }

    const user = guest
      ? await this.users.attachEmail(guest, email, param.locale)
      : await this.users.createEmailUser({ email, locale: param.locale });

    await this.billing.grantSignupBonus(user.id);

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

    return this.loginWithTelegramUser({
      telegramId: String(tgUser.id),
      telegramUsername: tgUser.username ?? null,
      firstName: tgUser.first_name ?? null,
      lastName: tgUser.last_name ?? null,
    });
  }

  /**
   * Вход по уже доверенным данным Telegram-пользователя. Так входит бот:
   * апдейт пришёл от Telegram на наш токен, отдельная проверка подписи ему не
   * нужна — в отличие от Mini App, где `initData` приходит через браузер.
   */
  public async loginWithTelegramUser(
    data: TelegramUserData,
  ): Promise<AuthResult> {
    const { user, created } = await this.users.upsertTelegramUser(data);

    // Вход через Telegram — сразу полноценный аккаунт (PRODUCT.md §4.3),
    // поэтому trial начисляется здесь же, но только при заведении аккаунта.
    if (created) {
      await this.billing.grantSignupBonus(user.id);
    }

    return this.buildResult(user);
  }

  private buildResult(user: User): AuthResult {
    const payload: JwtPayload = { sub: user.id };
    return { accessToken: this.jwt.sign(payload), user };
  }
}
