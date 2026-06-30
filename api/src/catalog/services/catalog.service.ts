import { Injectable, NotFoundException } from "@nestjs/common";

import { Hairstyle } from "../dao/hairstyle.entity";
import { CatalogRepository } from "../repositories/catalog.repository";

@Injectable()
export class CatalogService {
  constructor(private readonly repo: CatalogRepository) {}

  public listHairstyles(): Promise<Hairstyle[]> {
    return this.repo.findActive();
  }

  public async getHairstyle(slug: string): Promise<Hairstyle> {
    const hairstyle = await this.repo.findBySlug(slug);

    if (!hairstyle) {
      throw new NotFoundException(`Hairstyle "${slug}" not found`);
    }

    return hairstyle;
  }
}
