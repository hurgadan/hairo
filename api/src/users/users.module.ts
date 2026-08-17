import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Generation } from "../generation/dao/generation.entity";
import { PhotoAnalysis } from "../face-analysis/dao/photo-analysis.entity";
import { Photo } from "../photos/dao/photo.entity";
import { UsersController } from "./controllers/users.controller";
import { User } from "./dao/user.entity";
import { UsersRepository } from "./repositories/users.repository";
import { UsersService } from "./services/users.service";

@Module({
  // Photo/PhotoAnalysis/Generation — ради `mergeGuestInto`: перенос владения
  // данными гостя обязан быть атомарным, поэтому идёт одной транзакцией здесь,
  // а не тремя вызовами в чужие модули (это ещё и завело бы цикл зависимостей).
  // Регистрируем сущности, а не модули: нужны только метаданные.
  imports: [TypeOrmModule.forFeature([User, Photo, PhotoAnalysis, Generation])],
  controllers: [UsersController],
  providers: [UsersRepository, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
