import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { FaceAnalysisResult } from "../../_contracts/face-analysis/photo-analysis.type";
import { FACE_ANALYSIS_STATUS } from "../constants";

@Entity({ name: "photo_analyses" })
export class PhotoAnalysis {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Index("IDX_photo_analyses_user_id")
  @Column({ name: "user_id", type: "uuid" })
  public userId: string;

  @Index("IDX_photo_analyses_photo_id")
  @Column({ name: "photo_id", type: "uuid" })
  public photoId: string;

  @Column({ type: "varchar", default: FACE_ANALYSIS_STATUS.pending })
  public status: string;

  @Column({ type: "jsonb", nullable: true })
  public result: FaceAnalysisResult | null;

  @Column({ type: "text", nullable: true })
  public error: string | null;

  @CreateDateColumn({ name: "created_at" })
  public createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  public updatedAt: Date;
}
