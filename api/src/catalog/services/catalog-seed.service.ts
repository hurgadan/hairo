import * as fs from "node:fs";
import * as path from "node:path";

import { Injectable, Logger } from "@nestjs/common";

import { SEED_FILE_RELATIVE_PATH } from "../constants";
import { CatalogRepository } from "../repositories/catalog.repository";

interface SeedHairstyle {
  slug: string;
  name: Record<string, string>;
  group: string;
  desc_ru?: string;
  length: string;
  gender_presentation: string;
  texture?: string[];
  fringe?: string;
  layering?: string;
  finish?: string[];
  aesthetic?: string[];
  occasion?: string[];
  maintenance: string;
  era?: string;
  flatters_face_shapes?: string[];
  works_on_textures?: string[];
  suits_hair_density?: string[];
  hairstyle_fragment: string;
}

interface SeedFile {
  hairstyles: SeedHairstyle[];
}

@Injectable()
export class CatalogSeedService {
  private readonly logger = new Logger(CatalogSeedService.name);

  constructor(private readonly repo: CatalogRepository) {}

  public async seedHairstyles(): Promise<void> {
    const file = path.join(process.cwd(), SEED_FILE_RELATIVE_PATH);
    const parsed = JSON.parse(fs.readFileSync(file, "utf-8")) as SeedFile;

    for (const item of parsed.hairstyles) {
      await this.repo.upsertBySlug({
        slug: item.slug,
        name: item.name,
        description: item.desc_ru ? { ru: item.desc_ru } : null,
        groupName: item.group,
        length: item.length,
        genderPresentation: item.gender_presentation,
        fringe: item.fringe ?? null,
        layering: item.layering ?? null,
        era: item.era ?? null,
        maintenance: item.maintenance,
        texture: item.texture ?? [],
        finish: item.finish ?? [],
        aesthetic: item.aesthetic ?? [],
        occasion: item.occasion ?? [],
        flattersFaceShapes: item.flatters_face_shapes ?? [],
        worksOnTextures: item.works_on_textures ?? [],
        suitsHairDensity: item.suits_hair_density ?? [],
        hairstyleFragment: item.hairstyle_fragment,
      });
    }

    const total = await this.repo.count();
    this.logger.log(
      `Seeded ${parsed.hairstyles.length} hairstyles. Total in DB: ${total}`,
    );
  }
}
