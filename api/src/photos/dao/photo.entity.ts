import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { PhotoKind, PhotoStatus } from "../../_contracts";

@Entity({ name: "photos" })
export class Photo {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Index("IDX_photos_user_id")
  @Column({ name: "user_id", type: "uuid" })
  public userId: string;

  @Column({ name: "storage_key", type: "varchar", unique: true })
  public storageKey: string;

  @Column({ type: "varchar", default: PhotoKind.Selfie })
  public kind: PhotoKind;

  @Column({ type: "varchar", default: PhotoStatus.Uploaded })
  public status: PhotoStatus;

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
