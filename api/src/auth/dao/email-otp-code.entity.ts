import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

/**
 * Одноразовый код подтверждения email (passwordless-вход, `PRODUCT.md` §4.3).
 * Хранится только хеш — утечка таблицы не даёт войти. Строка живёт до чистки
 * ретеншеном: `consumed_at` и счётчик попыток нужны, чтобы код нельзя было
 * переиспользовать или подобрать.
 */
@Entity({ name: "email_otp_codes" })
export class EmailOtpCode {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  /** Нормализованный (trim + lowercase) адрес — по нему же считается rate-limit. */
  @Index("IDX_email_otp_codes_email")
  @Column({ type: "varchar" })
  public email: string;

  @Column({ name: "code_hash", type: "varchar" })
  public codeHash: string;

  /** Неудачные попытки ввода; на пределе код сгорает. */
  @Column({ type: "int", default: 0 })
  public attempts: number;

  @Column({ name: "expires_at", type: "timestamp" })
  public expiresAt: Date;

  /** Проставляется при успешной верификации — код становится непригоден. */
  @Column({ name: "consumed_at", type: "timestamp", nullable: true })
  public consumedAt: Date | null;

  /** IP запроса — второй ключ rate-limit, чтобы перебор адресов был дороже. */
  @Index("IDX_email_otp_codes_request_ip")
  @Column({ name: "request_ip", type: "varchar", nullable: true })
  public requestIp: string | null;

  @CreateDateColumn({ name: "created_at" })
  public createdAt: Date;
}
