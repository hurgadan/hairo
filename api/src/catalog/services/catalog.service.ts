import { Injectable, NotFoundException } from "@nestjs/common";

import { GenderPresentation } from "../../_contracts/enums";
import { HairstyleFilter } from "../../_contracts/catalog/hairstyle-filter.type";
import { MAINTENANCE_ORDER } from "../constants";
import { Hairstyle } from "../dao/hairstyle.entity";
import { CatalogRepository } from "../repositories/catalog.repository";

/** Причёска + матч-скор относительно переданного фильтра (не хранится в БД). */
export type HairstyleView = Hairstyle & { matchScore: number | null };

@Injectable()
export class CatalogService {
  constructor(private readonly repo: CatalogRepository) {}

  public async listHairstyles(
    filter: HairstyleFilter = {},
  ): Promise<HairstyleView[]> {
    const all = await this.repo.findActive();

    const hardFiltered = all.filter((h) => {
      if (
        filter.gender &&
        h.genderPresentation !== filter.gender &&
        h.genderPresentation !== GenderPresentation.Unisex
      ) {
        return false;
      }
      if (filter.length && h.length !== filter.length) {
        return false;
      }
      if (
        filter.maintenance &&
        MAINTENANCE_ORDER.indexOf(h.maintenance) >
          MAINTENANCE_ORDER.indexOf(filter.maintenance)
      ) {
        return false;
      }
      return true;
    });

    const maxScore =
      (filter.faceShape ? 1 : 0) +
      (filter.texture?.length ? 1 : 0) +
      (filter.density ? 1 : 0) +
      (filter.occasion?.length ?? 0);

    const scored: HairstyleView[] = hardFiltered.map((h) => {
      if (maxScore === 0) {
        return Object.assign(h, { matchScore: null });
      }

      let score = 0;
      if (filter.faceShape && h.flattersFaceShapes.includes(filter.faceShape)) {
        score += 1;
      }
      if (filter.texture?.some((t) => h.worksOnTextures.includes(t))) {
        score += 1;
      }
      if (filter.density && h.suitsHairDensity.includes(filter.density)) {
        score += 1;
      }
      if (filter.occasion) {
        score += filter.occasion.filter((o) => h.occasion.includes(o)).length;
      }

      const matchScore = Math.round((score / maxScore) * 100);
      return Object.assign(h, { matchScore });
    });

    return scored.sort(
      (a, b) =>
        (b.matchScore ?? -1) - (a.matchScore ?? -1) ||
        a.sortOrder - b.sortOrder,
    );
  }

  public async getHairstyle(slug: string): Promise<Hairstyle> {
    const hairstyle = await this.repo.findBySlug(slug);

    if (!hairstyle) {
      throw new NotFoundException(`Hairstyle "${slug}" not found`);
    }

    return hairstyle;
  }

  /** Используется вне каталога (например `generation`) для получения активной причёски по id. */
  public async getActive(id: string): Promise<Hairstyle> {
    const hairstyle = await this.repo.findActiveById(id);

    if (!hairstyle) {
      throw new NotFoundException(`Hairstyle "${id}" not found`);
    }

    return hairstyle;
  }
}
