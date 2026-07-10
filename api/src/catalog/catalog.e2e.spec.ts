import { Server } from "node:http";

import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { Repository } from "typeorm";

import {
  FaceShape,
  GenderPresentation,
  HairDensity,
  HairLength,
  HairTexture,
} from "../_contracts/enums";
import { Maintenance } from "../_contracts/catalog/enums/maintenance.enum";
import { Occasion } from "../_contracts/catalog/enums/occasion.enum";
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
        length: HairLength.Chin,
        genderPresentation: GenderPresentation.Feminine,
        maintenance: Maintenance.Low,
        texture: [HairTexture.Straight],
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
    expect(res.body[0].texture).toEqual([HairTexture.Straight]);
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

  it("applies hard filters (gender/length/maintenance) and excludes non-matching hairstyles", async () => {
    await seedOne({
      slug: "match",
      genderPresentation: GenderPresentation.Feminine,
    });
    await seedOne({
      slug: "wrong-gender",
      genderPresentation: GenderPresentation.Masculine,
    });
    await seedOne({
      slug: "unisex-ok",
      genderPresentation: GenderPresentation.Unisex,
    });

    const res = await request(httpServer)
      .get("/catalog/hairstyles")
      .query({ gender: GenderPresentation.Feminine })
      .expect(200);

    const slugs = res.body.map((h: { slug: string }) => h.slug).sort();
    expect(slugs).toEqual(["match", "unisex-ok"]);
  });

  it("excludes hairstyles above the requested maintenance ceiling", async () => {
    await seedOne({ slug: "low", maintenance: Maintenance.Low });
    await seedOne({ slug: "high", maintenance: Maintenance.High });

    const res = await request(httpServer)
      .get("/catalog/hairstyles")
      .query({ maintenance: Maintenance.Low })
      .expect(200);

    expect(res.body.map((h: { slug: string }) => h.slug)).toEqual(["low"]);
  });

  it("returns matchScore: null when no ranking parameters are given", async () => {
    await seedOne();

    const res = await request(httpServer)
      .get("/catalog/hairstyles")
      .expect(200);

    expect(res.body[0].matchScore).toBeNull();
  });

  it("scores and sorts by soft ranking overlap (faceShape/texture/density/occasion)", async () => {
    await seedOne({
      slug: "full-match",
      sortOrder: 20,
      flattersFaceShapes: [FaceShape.Oval],
      worksOnTextures: [HairTexture.Wavy],
      suitsHairDensity: [HairDensity.Medium],
      occasion: [Occasion.Everyday, Occasion.Work],
    });
    await seedOne({
      slug: "partial-match",
      sortOrder: 10,
      flattersFaceShapes: [FaceShape.Oval],
      worksOnTextures: [],
      suitsHairDensity: [],
      occasion: [],
    });

    const res = await request(httpServer)
      .get("/catalog/hairstyles")
      .query(
        `faceShape=${FaceShape.Oval}&texture=${HairTexture.Wavy}&density=${HairDensity.Medium}&occasion=${Occasion.Everyday}&occasion=${Occasion.Work}`,
      )
      .expect(200);

    expect(res.body.map((h: { slug: string }) => h.slug)).toEqual([
      "full-match",
      "partial-match",
    ]);
    expect(res.body[0].matchScore).toBe(100);
    expect(res.body[1].matchScore).toBeLessThan(100);
  });
});
