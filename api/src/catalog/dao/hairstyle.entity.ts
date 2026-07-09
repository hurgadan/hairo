import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import {
  FaceShape,
  GenderPresentation,
  HairDensity,
  HairLength,
  HairTexture,
} from "../../_contracts/enums";
import { Aesthetic } from "../../_contracts/catalog/enums/aesthetic.enum";
import { Fringe } from "../../_contracts/catalog/enums/fringe.enum";
import { Maintenance } from "../../_contracts/catalog/enums/maintenance.enum";
import { Occasion } from "../../_contracts/catalog/enums/occasion.enum";
import { LocalizedText } from "../../_contracts/localized-text.type";
import { Finish } from "../enums/finish.enum";
import { Layering } from "../enums/layering.enum";
import { Parting } from "../enums/parting.enum";
import { Silhouette } from "../enums/silhouette.enum";
import { Volume } from "../enums/volume.enum";

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
  public length: HairLength;

  @Column({ type: "varchar", nullable: true })
  public silhouette: Silhouette | null;

  @Column({ name: "gender_presentation" })
  public genderPresentation: GenderPresentation;

  @Column({ type: "varchar", nullable: true })
  public fringe: Fringe | null;

  @Column({ type: "varchar", nullable: true })
  public layering: Layering | null;

  @Column({ type: "varchar", nullable: true })
  public parting: Parting | null;

  @Column({ type: "varchar", nullable: true })
  public volume: Volume | null;

  /** Отсылка к эпохе — открытый словарь (CATALOG.md §1: "90s, y2k, 70s, 60s, modern, …"), не enum. */
  @Column({ type: "varchar", nullable: true })
  public era: string | null;

  @Column()
  public maintenance: Maintenance;

  @Column({ type: "text", array: true, default: () => "'{}'" })
  public texture: HairTexture[];

  @Column({ type: "text", array: true, default: () => "'{}'" })
  public finish: Finish[];

  @Column({ type: "text", array: true, default: () => "'{}'" })
  public aesthetic: Aesthetic[];

  @Column({ type: "text", array: true, default: () => "'{}'" })
  public occasion: Occasion[];

  // подходящесть (CATALOG.md §2) — для ранжирования
  @Column({
    name: "flatters_face_shapes",
    type: "text",
    array: true,
    default: () => "'{}'",
  })
  public flattersFaceShapes: FaceShape[];

  @Column({
    name: "works_on_textures",
    type: "text",
    array: true,
    default: () => "'{}'",
  })
  public worksOnTextures: HairTexture[];

  @Column({
    name: "suits_hair_density",
    type: "text",
    array: true,
    default: () => "'{}'",
  })
  public suitsHairDensity: HairDensity[];

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
