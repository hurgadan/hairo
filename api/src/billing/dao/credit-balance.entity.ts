import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

/** Материализованный баланс кредитов пользователя (source of truth для гейтинга). */
@Entity({ name: "credit_balances" })
export class CreditBalance {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Index("UQ_credit_balances_user_id", { unique: true })
  @Column({ name: "user_id", type: "uuid" })
  public userId: string;

  @Column({ type: "int", default: 0 })
  public balance: number;

  @CreateDateColumn({ name: "created_at" })
  public createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  public updatedAt: Date;
}
