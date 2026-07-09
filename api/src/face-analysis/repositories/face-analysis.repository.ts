import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { PhotoAnalysis } from "../dao/photo-analysis.entity";

@Injectable()
export class FaceAnalysisRepository {
  constructor(
    @InjectRepository(PhotoAnalysis)
    private readonly analyses: Repository<PhotoAnalysis>,
  ) {}

  public save(data: Partial<PhotoAnalysis>): Promise<PhotoAnalysis> {
    return this.analyses.save(this.analyses.create(data));
  }

  public findOwned(id: string, userId: string): Promise<PhotoAnalysis | null> {
    return this.analyses.findOne({ where: { id, userId } });
  }

  public async update(
    id: string,
    data: Partial<Pick<PhotoAnalysis, "status" | "result" | "error">>,
  ): Promise<void> {
    await this.analyses.update({ id }, data);
  }
}
