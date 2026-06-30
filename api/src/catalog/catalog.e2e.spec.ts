import { Server } from "node:http";

import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { Repository } from "typeorm";

import { clearTables } from "../_common/utils/tests/clear-tables";
import { createTestingAppAndHttpServer } from "../_common/utils/tests/create-testing-app-and-http-server";
import { getRepository } from "../_common/utils/tests/get-repository";
import { getTestingModuleImports } from "../_common/utils/tests/get-testing-module-imports";
import { CatalogModule } from "./catalog.module";
import { Hairstyle } from "./dao/hairstyle.entity";

describe("Catalog (e2e)", () => {
  let app: INestApplication;
  let httpServer: Server;
  let moduleFixture: TestingModule;
  let hairstyles: Repository<Hairstyle>;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [...getTestingModuleImports(), CatalogModule],
    }).compile();

    ({ app, httpServer } = await createTestingAppAndHttpServer(moduleFixture));
    hairstyles = getRepository<Hairstyle>(moduleFixture, Hairstyle);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearTables(moduleFixture);
  });

  const seedOne = (over: Partial<Hairstyle> = {}): Promise<Hairstyle> =>
    hairstyles.save(
      hairstyles.create({
        slug: "french-bob",
        name: { ru: "Французский боб" },
        groupName: "Боб",
        length: "chin",
        genderPresentation: "feminine",
        maintenance: "low",
        texture: ["straight"],
        hairstyleFragment: "classic french bob",
        isActive: true,
        sortOrder: 10,
        ...over,
      }),
    );

  it("GET /catalog/hairstyles returns only active hairstyles", async () => {
    await seedOne();
    await seedOne({ slug: "pixie", name: { ru: "Пикси" }, isActive: false });

    const res = await request(httpServer)
      .get("/catalog/hairstyles")
      .expect(200);

    expect(res.body).toHaveLength(1);
    expect(res.body[0].slug).toBe("french-bob");
    expect(res.body[0].name.ru).toBe("Французский боб");
    expect(res.body[0].texture).toEqual(["straight"]);
  });

  it("GET /catalog/hairstyles/:slug returns a single hairstyle", async () => {
    await seedOne();

    const res = await request(httpServer)
      .get("/catalog/hairstyles/french-bob")
      .expect(200);

    expect(res.body.name.ru).toBe("Французский боб");
  });

  it("GET /catalog/hairstyles/:slug returns 404 for unknown slug", async () => {
    await request(httpServer).get("/catalog/hairstyles/unknown").expect(404);
  });
});
