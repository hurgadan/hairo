import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Index("UQ_users_email", { unique: true, where: "email IS NOT NULL" })
  @Column({ type: "varchar", nullable: true })
  public email: string | null;

  @Column({ name: "password_hash", type: "varchar", nullable: true })
  public passwordHash: string | null;

  @Index("UQ_users_telegram_id", {
    unique: true,
    where: "telegram_id IS NOT NULL",
  })
  @Column({ name: "telegram_id", type: "bigint", nullable: true })
  public telegramId: string | null;

  @Column({ name: "telegram_username", type: "varchar", nullable: true })
  public telegramUsername: string | null;

  @Column({ name: "first_name", type: "varchar", nullable: true })
  public firstName: string | null;

  @Column({ name: "last_name", type: "varchar", nullable: true })
  public lastName: string | null;

  @Column({ type: "varchar", default: "ru" })
  public locale: string;

  @CreateDateColumn({ name: "created_at" })
  public createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  public updatedAt: Date;
}
