import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Generation } from "../dao/generation.entity";

@Injectable()
export class GenerationRepository {
  constructor(
    @InjectRepository(Generation)
    private readonly generations: Repository<Generation>,
  ) {}

  public save(data: Partial<Generation>): Promise<Generation> {
    return this.generations.save(this.generations.create(data));
  }

  public findOwned(id: string, userId: string): Promise<Generation | null> {
    return this.generations.findOne({ where: { id, userId } });
  }

  public findByPhotoId(photoId: string): Promise<Generation[]> {
    return this.generations.find({ where: { photoId } });
  }

  public async update(
    id: string,
    data: Partial<
      Pick<
        Generation,
        "status" | "resultStorageKey" | "resultContentType" | "error"
      >
    >,
  ): Promise<void> {
    await this.generations.update({ id }, data);
  }
}
