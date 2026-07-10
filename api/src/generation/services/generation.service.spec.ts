import { NotFoundException } from "@nestjs/common";

import { GenerationStatus } from "../../_contracts/generation/enums";
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

  const storage = {
    getObject: jest.fn(),
    putObject: jest.fn(),
    getPublicUrl: jest.fn(),
    getSignedDownloadUrl: jest.fn(),
  } as unknown as jest.Mocked<StorageService>;

  const imageModel = {
    generateImage: jest.fn(),
  } as unknown as jest.Mocked<ImageModelService>;

  const buildService = (): GenerationService =>
    new GenerationService(generations, photos, storage, imageModel);

  beforeEach(() => {
    jest.clearAllMocks();
    storage.getPublicUrl.mockReturnValue(null);
    storage.getSignedDownloadUrl.mockResolvedValue(
      "https://signed.example/result",
    );
  });

  describe("start", () => {
    it("rejects when the photo is not owned by the user, without creating a job", async () => {
      photos.getOwned.mockRejectedValue(
        new NotFoundException("Photo not found"),
      );
      const service = buildService();

      await expect(service.start("user-1", "photo-1")).rejects.toThrow(
        "Photo not found",
      );
      expect(generations.save).not.toHaveBeenCalled();
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
      const generation = await service.start("user-1", "photo-1");

      expect(generation).toEqual({
        id: "generation-1",
        resultStorageKey: null,
        resultUrl: null,
      });
      expect(generations.save).toHaveBeenCalledWith({
        userId: "user-1",
        photoId: "photo-1",
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
        prompt: expect.any(String),
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
      await service.start("user-1", "photo-1");
      await flushPromises();

      expect(imageModel.generateImage).toHaveBeenCalledTimes(1);
      expect(storage.putObject).not.toHaveBeenCalled();
      expect(generations.update).toHaveBeenCalledWith("generation-1", {
        status: GenerationStatus.Failed,
        error: "rate limited",
      });
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
      await service.start("user-1", "photo-1");
      await flushPromises();

      expect(storage.putObject).not.toHaveBeenCalled();
      expect(generations.update).toHaveBeenCalledWith("generation-1", {
        status: GenerationStatus.Failed,
        error: "model overloaded",
      });
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
