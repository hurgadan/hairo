import { NotFoundException } from "@nestjs/common";

import { GenerationStatus } from "../../_contracts/generation/enums";
import { BillingService } from "../../billing/services/billing.service";
import { InsufficientCreditsException } from "../../billing/exceptions/insufficient-credits.exception";
import { CatalogService } from "../../catalog/services/catalog.service";
import { ImageModelService } from "../../image-model/image-model.service";
import { PhotosService } from "../../photos/services/photos.service";
import { StorageService } from "../../storage/services/storage.service";
import { GenerationRepository } from "../repositories/generation.repository";
import { GenerationService } from "./generation.service";

const flushPromises = (): Promise<void> => new Promise((r) => setImmediate(r));

describe("GenerationService", () => {
  const generations = {
    save: jest.fn(),
    findOwned: jest.fn(),
    update: jest.fn(),
  } as unknown as jest.Mocked<GenerationRepository>;

  const photos = {
    getOwned: jest.fn(),
  } as unknown as jest.Mocked<PhotosService>;

  const catalog = {
    getActive: jest.fn(),
  } as unknown as jest.Mocked<CatalogService>;

  const storage = {
    getObject: jest.fn(),
    putObject: jest.fn(),
    getPublicUrl: jest.fn(),
    getSignedDownloadUrl: jest.fn(),
  } as unknown as jest.Mocked<StorageService>;

  const imageModel = {
    generateImage: jest.fn(),
  } as unknown as jest.Mocked<ImageModelService>;

  const billing = {
    debitForGeneration: jest.fn(),
    refundForGeneration: jest.fn(),
  } as unknown as jest.Mocked<BillingService>;

  const buildService = (): GenerationService =>
    new GenerationService(
      generations,
      photos,
      catalog,
      storage,
      imageModel,
      billing,
    );

  beforeEach(() => {
    jest.clearAllMocks();
    billing.debitForGeneration.mockResolvedValue(undefined);
    billing.refundForGeneration.mockResolvedValue(undefined);
    storage.getPublicUrl.mockReturnValue(null);
    storage.getSignedDownloadUrl.mockResolvedValue(
      "https://signed.example/result",
    );
    catalog.getActive.mockResolvedValue({
      id: "hairstyle-1",
      hairstyleFragment: "long layered hair past the chest",
    } as never);
  });

  describe("start", () => {
    it("rejects when the photo is not owned by the user, without creating a job", async () => {
      photos.getOwned.mockRejectedValue(
        new NotFoundException("Photo not found"),
      );
      const service = buildService();

      await expect(
        service.start("user-1", "photo-1", "hairstyle-1"),
      ).rejects.toThrow("Photo not found");
      expect(generations.save).not.toHaveBeenCalled();
    });

    it("rejects when the hairstyle is not found/inactive, without creating a job", async () => {
      photos.getOwned.mockResolvedValue({ id: "photo-1" } as never);
      catalog.getActive.mockRejectedValue(
        new NotFoundException("Hairstyle not found"),
      );
      const service = buildService();

      await expect(
        service.start("user-1", "photo-1", "hairstyle-1"),
      ).rejects.toThrow("Hairstyle not found");
      expect(generations.save).not.toHaveBeenCalled();
      expect(billing.debitForGeneration).not.toHaveBeenCalled();
    });

    it("rejects with 402 when the balance is insufficient, without creating a job", async () => {
      photos.getOwned.mockResolvedValue({ id: "photo-1" } as never);
      billing.debitForGeneration.mockRejectedValue(
        new InsufficientCreditsException(),
      );
      const service = buildService();

      await expect(
        service.start("user-1", "photo-1", "hairstyle-1"),
      ).rejects.toBeInstanceOf(InsufficientCreditsException);
      expect(generations.save).not.toHaveBeenCalled();
    });

    it("refunds the credit when the job row fails to persist", async () => {
      photos.getOwned.mockResolvedValue({ id: "photo-1" } as never);
      generations.save.mockRejectedValue(new Error("db down"));
      const service = buildService();

      await expect(
        service.start("user-1", "photo-1", "hairstyle-1"),
      ).rejects.toThrow("db down");
      expect(billing.debitForGeneration).toHaveBeenCalledWith("user-1");
      expect(billing.refundForGeneration).toHaveBeenCalledWith("user-1");
    });

    it("creates a pending job, returns immediately, and completes it in the background", async () => {
      photos.getOwned.mockResolvedValue({
        id: "photo-1",
        storageKey: "photos/user-1/photo-1.png",
        contentType: "image/png",
      } as never);
      generations.save.mockResolvedValue({
        id: "generation-1",
        resultStorageKey: null,
      } as never);
      storage.getObject.mockResolvedValue(Buffer.from("selfie"));
      imageModel.generateImage
        .mockResolvedValueOnce(Buffer.from("enhanced"))
        .mockResolvedValueOnce(Buffer.from("restyled"));

      const service = buildService();
      const generation = await service.start(
        "user-1",
        "photo-1",
        "hairstyle-1",
      );

      expect(generation).toEqual({
        id: "generation-1",
        resultStorageKey: null,
        resultUrl: null,
      });
      expect(billing.debitForGeneration).toHaveBeenCalledWith("user-1");
      expect(generations.save).toHaveBeenCalledWith({
        userId: "user-1",
        photoId: "photo-1",
        hairstyleId: "hairstyle-1",
        status: GenerationStatus.Pending,
      });
      // фоновая часть ещё не выполнилась синхронно
      expect(imageModel.generateImage).not.toHaveBeenCalled();

      await flushPromises();

      expect(imageModel.generateImage).toHaveBeenNthCalledWith(1, {
        images: [{ data: Buffer.from("selfie"), mimeType: "image/png" }],
        prompt: expect.any(String),
      });
      expect(imageModel.generateImage).toHaveBeenNthCalledWith(2, {
        images: [{ data: Buffer.from("enhanced"), mimeType: "image/png" }],
        prompt: expect.stringContaining("long layered hair past the chest"),
      });
      expect(storage.putObject).toHaveBeenCalledWith({
        key: "generations/user-1/generation-1.png",
        body: Buffer.from("restyled"),
        contentType: "image/png",
      });
      expect(generations.update).toHaveBeenCalledWith("generation-1", {
        status: GenerationStatus.Completed,
        resultStorageKey: "generations/user-1/generation-1.png",
        resultContentType: "image/png",
      });
      expect(billing.refundForGeneration).not.toHaveBeenCalled();
    });

    it("marks the job as failed and skips restyle when the enhance step fails", async () => {
      photos.getOwned.mockResolvedValue({
        id: "photo-1",
        storageKey: "photos/user-1/photo-1.png",
        contentType: "image/png",
      } as never);
      generations.save.mockResolvedValue({
        id: "generation-1",
        resultStorageKey: null,
      } as never);
      storage.getObject.mockResolvedValue(Buffer.from("selfie"));
      imageModel.generateImage.mockRejectedValueOnce(new Error("rate limited"));

      const service = buildService();
      await service.start("user-1", "photo-1", "hairstyle-1");
      await flushPromises();

      expect(imageModel.generateImage).toHaveBeenCalledTimes(1);
      expect(storage.putObject).not.toHaveBeenCalled();
      expect(generations.update).toHaveBeenCalledWith("generation-1", {
        status: GenerationStatus.Failed,
        error: "rate limited",
      });
      expect(billing.refundForGeneration).toHaveBeenCalledWith(
        "user-1",
        "generation-1",
      );
    });

    it("marks the job as failed when the restyle step fails", async () => {
      photos.getOwned.mockResolvedValue({
        id: "photo-1",
        storageKey: "photos/user-1/photo-1.png",
        contentType: "image/png",
      } as never);
      generations.save.mockResolvedValue({
        id: "generation-1",
        resultStorageKey: null,
      } as never);
      storage.getObject.mockResolvedValue(Buffer.from("selfie"));
      imageModel.generateImage
        .mockResolvedValueOnce(Buffer.from("enhanced"))
        .mockRejectedValueOnce(new Error("model overloaded"));

      const service = buildService();
      await service.start("user-1", "photo-1", "hairstyle-1");
      await flushPromises();

      expect(storage.putObject).not.toHaveBeenCalled();
      expect(generations.update).toHaveBeenCalledWith("generation-1", {
        status: GenerationStatus.Failed,
        error: "model overloaded",
      });
      expect(billing.refundForGeneration).toHaveBeenCalledWith(
        "user-1",
        "generation-1",
      );
    });
  });

  describe("getOwned", () => {
    it("returns the generation with a signed result URL when owned and completed", async () => {
      generations.findOwned.mockResolvedValue({
        id: "generation-1",
        resultStorageKey: "generations/user-1/generation-1.png",
      } as never);
      const service = buildService();

      const generation = await service.getOwned("user-1", "generation-1");

      expect(generation).toEqual({
        id: "generation-1",
        resultStorageKey: "generations/user-1/generation-1.png",
        resultUrl: "https://signed.example/result",
      });
    });

    it("throws NotFoundException when not owned", async () => {
      generations.findOwned.mockResolvedValue(null);
      const service = buildService();

      await expect(service.getOwned("user-1", "generation-1")).rejects.toThrow(
        "Generation not found",
      );
    });
  });
});
