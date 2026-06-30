import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import type { LocalizedText } from "./hairstyle.entity";

@Entity({ name: "color_options" })
export class ColorOption {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Column({ unique: true })
  public slug: string;

  @Column({ type: "jsonb" })
  public name: LocalizedText;

  @Column()
  public family: string; // natural | fashion

  @Column({ type: "int", nullable: true })
  public level: number | null;

  @Column()
  public technique: string; // solid | balayage | highlights | ombre | money-piece | roots

  @Column({ name: "hex_swatch", type: "varchar", nullable: true })
  public hexSwatch: string | null;

  @Column({ name: "prompt_fragment", type: "text" })
  public promptFragment: string;

  @Column({ name: "is_active", default: true })
  public isActive: boolean;

  @Column({ name: "sort_order", type: "int", default: 0 })
  public sortOrder: number;

  @CreateDateColumn({ name: "created_at" })
  public createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  public updatedAt: Date;
}
