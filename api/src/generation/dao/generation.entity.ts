import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { GenerationStatus } from "../../_contracts";

@Entity({ name: "generations" })
export class Generation {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Index("IDX_generations_user_id")
  @Column({ name: "user_id", type: "uuid" })
  public userId: string;

  @Index("IDX_generations_photo_id")
  @Column({ name: "photo_id", type: "uuid" })
  public photoId: string;

  @Column({ type: "varchar", default: GenerationStatus.Pending })
  public status: GenerationStatus;

  @Column({ name: "result_storage_key", type: "varchar", nullable: true })
  public resultStorageKey: string | null;

  @Column({ name: "result_content_type", type: "varchar", nullable: true })
  public resultContentType: string | null;

  @Column({ type: "text", nullable: true })
  public error: string | null;

  @CreateDateColumn({ name: "created_at" })
  public createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  public updatedAt: Date;
}
