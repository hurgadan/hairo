import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { LocalizedText } from "../../_contracts/localized-text.type";

export type { LocalizedText };

@Entity({ name: "hairstyles" })
export class Hairstyle {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Column({ unique: true })
  public slug: string;

  @Column({ type: "jsonb" })
  public name: LocalizedText;

  @Column({ type: "jsonb", nullable: true })
  public description: LocalizedText | null;

  @Column({ name: "group_name" })
  public groupName: string;

  // структурные теги (CATALOG.md §1)
  @Column()
  public length: string;

  @Column({ type: "varchar", nullable: true })
  public silhouette: string | null;

  @Column({ name: "gender_presentation" })
  public genderPresentation: string;

  @Column({ type: "varchar", nullable: true })
  public fringe: string | null;

  @Column({ type: "varchar", nullable: true })
  public layering: string | null;

  @Column({ type: "varchar", nullable: true })
  public parting: string | null;

  @Column({ type: "varchar", nullable: true })
  public volume: string | null;

  @Column({ type: "varchar", nullable: true })
  public era: string | null;

  @Column()
  public maintenance: string;

  @Column({ type: "text", array: true, default: () => "'{}'" })
  public texture: string[];

  @Column({ type: "text", array: true, default: () => "'{}'" })
  public finish: string[];

  @Column({ type: "text", array: true, default: () => "'{}'" })
  public aesthetic: string[];

  @Column({ type: "text", array: true, default: () => "'{}'" })
  public occasion: string[];

  // подходящесть (CATALOG.md §2) — для ранжирования
  @Column({
    name: "flatters_face_shapes",
    type: "text",
    array: true,
    default: () => "'{}'",
  })
  public flattersFaceShapes: string[];

  @Column({
    name: "works_on_textures",
    type: "text",
    array: true,
    default: () => "'{}'",
  })
  public worksOnTextures: string[];

  @Column({
    name: "suits_hair_density",
    type: "text",
    array: true,
    default: () => "'{}'",
  })
  public suitsHairDensity: string[];

  // ассеты
  @Column({ name: "hairstyle_fragment", type: "text" })
  public hairstyleFragment: string;

  @Column({ name: "preview_image", type: "varchar", nullable: true })
  public previewImage: string | null;

  @Column({ name: "reference_image", type: "varchar", nullable: true })
  public referenceImage: string | null;

  @Column({ name: "is_active", default: true })
  public isActive: boolean;

  @Column({ name: "sort_order", type: "int", default: 0 })
  public sortOrder: number;

  @CreateDateColumn({ name: "created_at" })
  public createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  public updatedAt: Date;
}
