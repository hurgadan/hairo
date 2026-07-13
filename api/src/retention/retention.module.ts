import { Module } from "@nestjs/common";

import { GenerationModule } from "../generation/generation.module";
import { PhotosModule } from "../photos/photos.module";
import { UsersModule } from "../users/users.module";
import { RetentionService } from "./services/retention.service";

@Module({
  imports: [UsersModule, PhotosModule, GenerationModule],
  providers: [RetentionService],
})
export class RetentionModule {}
