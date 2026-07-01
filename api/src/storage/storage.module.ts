import { Global, Module } from "@nestjs/common";

import { StorageService } from "./services/storage.service";

/**
 * Инфраструктурный модуль хранилища. Global — чтобы StorageService был доступен
 * доменным модулям (photos, generation, catalog) без повторного импорта.
 */
@Global()
@Module({
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
