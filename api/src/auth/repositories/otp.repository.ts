import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, MoreThan, Repository } from "typeorm";

import { EmailOtpCode } from "../dao/email-otp-code.entity";

export interface CreateOtpCodeData {
  email: string;
  codeHash: string;
  expiresAt: Date;
  requestIp: string | null;
}

@Injectable()
export class OtpRepository {
  constructor(
    @InjectRepository(EmailOtpCode)
    private readonly codes: Repository<EmailOtpCode>,
  ) {}

  public create(data: CreateOtpCodeData): Promise<EmailOtpCode> {
    return this.codes.save(this.codes.create(data));
  }

  /** Последний непогашенный и не истёкший код адреса — кандидат на проверку. */
  public findActiveByEmail(
    email: string,
    now: Date,
  ): Promise<EmailOtpCode | null> {
    return this.codes.findOne({
      where: { email, consumedAt: IsNull(), expiresAt: MoreThan(now) },
      order: { createdAt: "DESC" },
    });
  }

  public findLastByEmail(email: string): Promise<EmailOtpCode | null> {
    return this.codes.findOne({
      where: { email },
      order: { createdAt: "DESC" },
    });
  }

  public async countByIpSince(ip: string, since: Date): Promise<number> {
    return this.codes.count({
      where: { requestIp: ip, createdAt: MoreThan(since) },
    });
  }

  public async incrementAttempts(id: string): Promise<void> {
    await this.codes.increment({ id }, "attempts", 1);
  }

  public async markConsumed(id: string, at: Date): Promise<void> {
    await this.codes.update({ id }, { consumedAt: at });
  }

  /**
   * Гасит все живые коды адреса — вызывается перед выдачей нового, чтобы
   * действующим оставался ровно один код.
   */
  public async consumeAllForEmail(email: string, at: Date): Promise<void> {
    await this.codes.update(
      { email, consumedAt: IsNull() },
      { consumedAt: at },
    );
  }
}
