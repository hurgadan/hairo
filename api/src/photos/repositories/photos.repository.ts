import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Photo } from "../dao/photo.entity";

@Injectable()
export class PhotosRepository {
  constructor(
    @InjectRepository(Photo)
    private readonly photos: Repository<Photo>,
  ) {}

  public save(data: Partial<Photo>): Promise<Photo> {
    return this.photos.save(this.photos.create(data));
  }

  public findByUser(userId: string): Promise<Photo[]> {
    return this.photos.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });
  }

  public findOwned(id: string, userId: string): Promise<Photo | null> {
    return this.photos.findOne({ where: { id, userId } });
  }

  public async remove(photo: Photo): Promise<void> {
    await this.photos.remove(photo);
  }
}
