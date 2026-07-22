import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

import { CreditTransactionType } from "../../_contracts/billing/enums/transaction-type.enum";

/**
 * Иммутабельный леджер движений кредитов (аудит/история).
 * Строки не редактируются и не удаляются вместе с генерацией — `generation_id`
 * без FK-каскада (генерация может быть вычищена ретеншеном, запись остаётся).
 */
@Entity({ name: "credit_transactions" })
export class CreditTransaction {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Index("IDX_credit_transactions_user_id")
  @Column({ name: "user_id", type: "uuid" })
  public userId: string;

  /** Знаковое изменение баланса: `+` — начисление, `−` — списание. */
  @Column({ type: "int" })
  public amount: number;

  @Column({ type: "varchar" })
  public type: CreditTransactionType;

  /** Свободное описание (напр. Stripe session id) — служебное, не отдаётся в DTO. */
  @Column({ type: "varchar", nullable: true })
  public reason: string | null;

  @Column({ name: "generation_id", type: "uuid", nullable: true })
  public generationId: string | null;

  /** Идемпотентность Stripe-вебхука (Срез 3) — один event начисляет один раз. */
  @Index("UQ_credit_transactions_stripe_event_id", {
    unique: true,
    where: "stripe_event_id IS NOT NULL",
  })
  @Column({ name: "stripe_event_id", type: "varchar", nullable: true })
  public stripeEventId: string | null;

  @CreateDateColumn({ name: "created_at" })
  public createdAt: Date;
}
