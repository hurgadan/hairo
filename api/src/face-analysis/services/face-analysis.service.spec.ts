import { NotFoundException } from "@nestjs/common";

import { FaceAnalysisStatus } from "../../_contracts/face-analysis/photo-analysis.type";
import { LlmModelService } from "../../llm-model/llm-model.service";
import { PhotosService } from "../../photos/services/photos.service";
import { StorageService } from "../../storage/services/storage.service";
import { FaceAnalysisRepository } from "../repositories/face-analysis.repository";
import { FaceAnalysisService } from "./face-analysis.service";

const flushPromises = (): Promise<void> => new Promise((r) => setImmediate(r));

describe("FaceAnalysisService", () => {
  const analyses = {
    save: jest.fn(),
    findOwned: jest.fn(),
    update: jest.fn(),
  } as unknown as jest.Mocked<FaceAnalysisRepository>;

  const photos = {
    getOwned: jest.fn(),
  } as unknown as jest.Mocked<PhotosService>;

  const storage = {
    getObject: jest.fn(),
  } as unknown as jest.Mocked<StorageService>;

  const llmModel = {
    generateStructured: jest.fn(),
  } as unknown as jest.Mocked<LlmModelService>;

  const buildService = (): FaceAnalysisService =>
    new FaceAnalysisService(analyses, photos, storage, llmModel);

  beforeEach(() => {
    jest.clearAllMocks();
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
      expect(analyses.save).not.toHaveBeenCalled();
    });

    it("creates a pending job, returns immediately, and completes the job in the background", async () => {
      photos.getOwned.mockResolvedValue({
        id: "photo-1",
        storageKey: "photos/user-1/photo-1.png",
        contentType: "image/png",
      } as never);
      analyses.save.mockResolvedValue({ id: "analysis-1" } as never);
      storage.getObject.mockResolvedValue(Buffer.from("bytes"));
      llmModel.generateStructured.mockResolvedValue({ faceShape: "oval" });

      const service = buildService();
      const analysis = await service.start("user-1", "photo-1");

      expect(analysis).toEqual({ id: "analysis-1" });
      expect(analyses.save).toHaveBeenCalledWith({
        userId: "user-1",
        photoId: "photo-1",
        status: FaceAnalysisStatus.Pending,
      });
      // фоновая часть ещё не выполнилась синхронно
      expect(llmModel.generateStructured).not.toHaveBeenCalled();

      await flushPromises();

      expect(llmModel.generateStructured).toHaveBeenCalledWith({
        images: [{ data: Buffer.from("bytes"), mimeType: "image/png" }],
        prompt: expect.any(String),
        responseSchema: expect.any(Object),
      });
      expect(analyses.update).toHaveBeenCalledWith("analysis-1", {
        status: FaceAnalysisStatus.Completed,
        result: { faceShape: "oval" },
      });
    });

    it("marks the job as failed instead of throwing when the LLM call fails", async () => {
      photos.getOwned.mockResolvedValue({
        id: "photo-1",
        storageKey: "photos/user-1/photo-1.png",
        contentType: "image/png",
      } as never);
      analyses.save.mockResolvedValue({ id: "analysis-1" } as never);
      storage.getObject.mockResolvedValue(Buffer.from("bytes"));
      llmModel.generateStructured.mockRejectedValue(new Error("rate limited"));

      const service = buildService();
      await service.start("user-1", "photo-1");
      await flushPromises();

      expect(analyses.update).toHaveBeenCalledWith("analysis-1", {
        status: FaceAnalysisStatus.Failed,
        error: "rate limited",
      });
    });
  });

  describe("getOwned", () => {
    it("returns the analysis when owned", async () => {
      analyses.findOwned.mockResolvedValue({ id: "analysis-1" } as never);
      const service = buildService();

      await expect(service.getOwned("user-1", "analysis-1")).resolves.toEqual({
        id: "analysis-1",
      });
    });

    it("throws NotFoundException when not owned", async () => {
      analyses.findOwned.mockResolvedValue(null);
      const service = buildService();

      await expect(service.getOwned("user-1", "analysis-1")).rejects.toThrow(
        "Analysis not found",
      );
    });
  });
});
