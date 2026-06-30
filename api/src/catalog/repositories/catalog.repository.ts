import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Hairstyle } from "../dao/hairstyle.entity";

@Injectable()
export class CatalogRepository {
  constructor(
    @InjectRepository(Hairstyle)
    private readonly hairstyles: Repository<Hairstyle>,
  ) {}

  public findActive(): Promise<Hairstyle[]> {
    return this.hairstyles.find({
      where: { isActive: true },
      order: { sortOrder: "ASC", slug: "ASC" },
    });
  }

  public findBySlug(slug: string): Promise<Hairstyle | null> {
    return this.hairstyles.findOne({ where: { slug } });
  }

  public count(): Promise<number> {
    return this.hairstyles.count();
  }

  public async upsertBySlug(data: Partial<Hairstyle>): Promise<void> {
    const existing = await this.hairstyles.findOne({
      where: { slug: data.slug },
    });

    if (existing) {
      await this.hairstyles.update({ slug: data.slug }, data);
    } else {
      await this.hairstyles.insert(data);
    }
  }
}
