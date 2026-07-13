import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { Repository } from "typeorm";

import {
  GenderPresentation,
  HairLength,
  HairTexture,
} from "../_contracts/enums";
import { GenerationStatus } from "../_contracts/generation/enums";
import { Maintenance } from "../_contracts/catalog/enums/maintenance.enum";
import { clearTables } from "../_common/utils/tests/clear-tables";
import { createTestingAppAndHttpServer } from "../_common/utils/tests/create-testing-app-and-http-server";
import { getRepository } from "../_common/utils/tests/get-repository";
import { getTestingModuleImports } from "../_common/utils/tests/get-testing-module-imports";
import { CatalogModule } from "../catalog/catalog.module";
import { Hairstyle } from "../catalog/dao/hairstyle.entity";
import { Generation } from "../generation/dao/generation.entity";
import { GenerationModule } from "../generation/generation.module";
import { ImageModelModule } from "../image-model/image-model.module";
import { ImageModelService } from "../image-model/image-model.service";
import { Photo } from "../photos/dao/photo.entity";
import { PhotosModule } from "../photos/photos.module";
import { StorageService } from "../storage/services/storage.service";
import { StorageModule } from "../storage/storage.module";
import { User } from "../users/dao/user.entity";
import { UsersModule } from "../users/users.module";
import { RetentionModule } from "./retention.module";
import { RetentionService } from "./services/retention.service";

const RETENTION_INACTIVITY_DAYS = 30;

describe("Retention (e2e)", () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let users: Repository<User>;
  let photos: Repository<Photo>;
  let generations: Repository<Generation>;
  let hairstyles: Repository<Hairstyle>;
  let retention: RetentionService;

  const storageMock = {
    putObject: jest.fn().mockResolvedValue(undefined),
    deleteObject: jest.fn().mockResolvedValue(undefined),
    getObject: jest.fn().mockResolvedValue(Buffer.from("bytes")),
    getPublicUrl: jest.fn().mockReturnValue(null),
    getSignedDownloadUrl: jest
      .fn()
      .mockResolvedValue("https://signed.example/x"),
  };

  const imageModelMock = { generateImage: jest.fn() };

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        ...getTestingModuleImports(),
        UsersModule,
        StorageModule,
        PhotosModule,
        CatalogModule,
        ImageModelModule,
        GenerationModule,
        RetentionModule,
      ],
    })
      .overrideProvider(StorageService)
      .useValue(storageMock)
      .overrideProvider(ImageModelService)
      .useValue(imageModelMock)
      .compile();

    ({ app } = await createTestingAppAndHttpServer(moduleFixture));
    users = getRepository<User>(moduleFixture, User);
    photos = getRepository<Photo>(moduleFixture, Photo);
    generations = getRepository<Generation>(moduleFixture, Generation);
    hairstyles = getRepository<Hairstyle>(moduleFixture, Hairstyle);
    retention = moduleFixture.get(RetentionService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearTables(moduleFixture);
    jest.clearAllMocks();
  });

  async function seedInactiveUserWithPhotoAndGeneration(): Promise<{
    userId: string;
    photoId: string;
  }> {
    const staleDate = new Date(
      Date.now() - (RETENTION_INACTIVITY_DAYS + 1) * 24 * 60 * 60 * 1000,
    );
    const user = await users.save(users.create({ lastActiveAt: staleDate }));

    const hairstyle = await hairstyles.save(
      hairstyles.create({
        slug: `style-${Date.now()}-${Math.random()}`,
        name: { ru: "Тест" },
        groupName: "Тест",
        length: HairLength.Shoulder,
        genderPresentation: GenderPresentation.Unisex,
        maintenance: Maintenance.Medium,
        texture: [HairTexture.Wavy],
        hairstyleFragment: "test fragment",
        isActive: true,
        sortOrder: 0,
      }),
    );

    const photo = await photos.save(
      photos.create({
        userId: user.id,
        storageKey: `photos/${user.id}/selfie.png`,
        contentType: "image/png",
        sizeBytes: 123,
        consentAt: new Date(),
      }),
    );

    await generations.save(
      generations.create({
        userId: user.id,
        photoId: photo.id,
        hairstyleId: hairstyle.id,
        status: GenerationStatus.Completed,
        resultStorageKey: `generations/${user.id}/result.png`,
        resultContentType: "image/png",
      }),
    );

    return { userId: user.id, photoId: photo.id };
  }

  it("deletes photos and generation result objects for a user inactive 30+ days", async () => {
    const { userId, photoId } = await seedInactiveUserWithPhotoAndGeneration();

    await retention.cleanupInactiveUsers();

    expect(storageMock.deleteObject).toHaveBeenCalledWith(
      `generations/${userId}/result.png`,
    );
    expect(storageMock.deleteObject).toHaveBeenCalledWith(
      `photos/${userId}/selfie.png`,
    );

    expect(await photos.findOne({ where: { id: photoId } })).toBeNull();
    expect(await generations.findOne({ where: { photoId } })).toBeNull();
  });

  it("does not touch photos of a recently active user", async () => {
    const user = await users.save(users.create({ lastActiveAt: new Date() }));
    const photo = await photos.save(
      photos.create({
        userId: user.id,
        storageKey: `photos/${user.id}/selfie.png`,
        contentType: "image/png",
        sizeBytes: 123,
        consentAt: new Date(),
      }),
    );

    await retention.cleanupInactiveUsers();

    expect(storageMock.deleteObject).not.toHaveBeenCalled();
    expect(await photos.findOne({ where: { id: photo.id } })).not.toBeNull();
  });
});
