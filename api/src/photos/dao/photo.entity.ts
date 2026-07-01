import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { PHOTO_KIND, PHOTO_STATUS } from "../constants";

@Entity({ name: "photos" })
export class Photo {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Index("IDX_photos_user_id")
  @Column({ name: "user_id", type: "uuid" })
  public userId: string;

  @Column({ name: "storage_key", type: "varchar", unique: true })
  public storageKey: string;

  @Column({ type: "varchar", default: PHOTO_KIND.selfie })
  public kind: string;

  @Column({ type: "varchar", default: PHOTO_STATUS.uploaded })
  public status: string;

  @Column({ name: "content_type", type: "varchar" })
  public contentType: string;

  @Column({ name: "size_bytes", type: "int" })
  public sizeBytes: number;

  /** Момент явного согласия на обработку фото (GDPR). */
  @Column({ name: "consent_at", type: "timestamp" })
  public consentAt: Date;

  @CreateDateColumn({ name: "created_at" })
  public createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  public updatedAt: Date;
}
