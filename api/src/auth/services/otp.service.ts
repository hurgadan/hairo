import * as crypto from "node:crypto";

import { Injectable, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";

import { OtpRequestResult } from "../../_contracts/auth/otp-request-result.type";
import { Locale } from "../../_contracts/users/enums/locale.enum";
import { MailService } from "../../mail/services/mail.service";
import {
  OTP_CODE_LENGTH,
  OTP_EXPIRES_IN_MINUTES,
  OTP_IP_MAX_REQUESTS,
  OTP_IP_WINDOW_MINUTES,
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_AFTER_SECONDS,
} from "../constants";
import { TooManyOtpRequestsException } from "../exceptions/too-many-otp-requests.exception";
import { OtpRepository } from "../repositories/otp.repository";

const BCRYPT_ROUNDS = 10;

export interface RequestOtpParams {
  email: string;
  locale?: Locale;
  requestIp: string | null;
}

@Injectable()
export class OtpService {
  constructor(
    private readonly repo: OtpRepository,
    private readonly mail: MailService,
  ) {}

  /**
   * Выдаёт новый код и отправляет письмо. Ответ одинаков независимо от того,
   * есть ли аккаунт с таким адресом — иначе эндпоинт превращается в проверку
   * «зарегистрирован ли этот email».
   */
  public async request(param: RequestOtpParams): Promise<OtpRequestResult> {
    const email = normalizeEmail(param.email);
    const now = new Date();

    await this.assertNotThrottled(email, param.requestIp, now);

    const code = generateCode();
    // Прежние коды гасим: действующим остаётся ровно один, последний.
    await this.repo.consumeAllForEmail(email, now);
    await this.repo.create({
      email,
      codeHash: await bcrypt.hash(code, BCRYPT_ROUNDS),
      expiresAt: new Date(now.getTime() + OTP_EXPIRES_IN_MINUTES * 60_000),
      requestIp: param.requestIp,
    });

    await this.mail.sendVerificationCode({
      to: email,
      code,
      expiresInMinutes: OTP_EXPIRES_IN_MINUTES,
    });

    return {
      expiresInMinutes: OTP_EXPIRES_IN_MINUTES,
      resendAfterSeconds: OTP_RESEND_AFTER_SECONDS,
    };
  }

  /**
   * Проверяет код и гасит его. Бросает 401 на любой неуспех — истёк, исчерпан
   * попытками, не совпал или его вовсе не было: разные формулировки подсказали
   * бы атакующему, какой адрес запрашивал код.
   */
  public async verify(rawEmail: string, code: string): Promise<void> {
    const email = normalizeEmail(rawEmail);
    const active = await this.repo.findActiveByEmail(email, new Date());

    if (!active || active.attempts >= OTP_MAX_ATTEMPTS) {
      throw new UnauthorizedException("Invalid or expired code");
    }

    if (!(await bcrypt.compare(code, active.codeHash))) {
      await this.repo.incrementAttempts(active.id);
      throw new UnauthorizedException("Invalid or expired code");
    }

    await this.repo.markConsumed(active.id, new Date());
  }

  private async assertNotThrottled(
    email: string,
    requestIp: string | null,
    now: Date,
  ): Promise<void> {
    const last = await this.repo.findLastByEmail(email);

    if (last) {
      const elapsedSeconds = (now.getTime() - last.createdAt.getTime()) / 1000;
      if (elapsedSeconds < OTP_RESEND_AFTER_SECONDS) {
        throw new TooManyOtpRequestsException(
          Math.ceil(OTP_RESEND_AFTER_SECONDS - elapsedSeconds),
        );
      }
    }

    if (!requestIp) {
      return;
    }

    const windowStart = new Date(
      now.getTime() - OTP_IP_WINDOW_MINUTES * 60_000,
    );
    const fromIp = await this.repo.countByIpSince(requestIp, windowStart);

    if (fromIp >= OTP_IP_MAX_REQUESTS) {
      throw new TooManyOtpRequestsException(OTP_IP_WINDOW_MINUTES * 60);
    }
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Код из `crypto.randomInt` — криптостойкий источник; `Math.random` для
 * секретов не годится.
 */
function generateCode(): string {
  const max = 10 ** OTP_CODE_LENGTH;
  return crypto.randomInt(0, max).toString().padStart(OTP_CODE_LENGTH, "0");
}
