import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

import { GenerationService } from "../../generation/services/generation.service";
import { PhotosService } from "../../photos/services/photos.service";
import { UsersService } from "../../users/services/users.service";
import { RETENTION_INACTIVITY_DAYS } from "../constants";

@Injectable()
export class RetentionService {
  private readonly logger = new Logger(RetentionService.name);

  constructor(
    private readonly users: UsersService,
    private readonly photos: PhotosService,
    private readonly generation: GenerationService,
  ) {}

  /** GDPR: удаляет фото (и результаты генераций) владельцев, неактивных 30+ дней. */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  public async cleanupInactiveUsers(): Promise<void> {
    const cutoff = new Date(
      Date.now() - RETENTION_INACTIVITY_DAYS * 24 * 60 * 60 * 1000,
    );
    const inactiveUsers = await this.users.findInactiveSince(cutoff);

    let deletedPhotos = 0;
    for (const user of inactiveUsers) {
      const userPhotos = await this.photos.list(user.id);
      for (const photo of userPhotos) {
        await this.generation.deleteResultsForPhoto(photo.id);
        await this.photos.remove(user.id, photo.id);
        deletedPhotos += 1;
      }
    }

    this.logger.log(
      `Retention cleanup: removed ${deletedPhotos} photo(s) for ${inactiveUsers.length} inactive user(s)`,
    );
  }
}
