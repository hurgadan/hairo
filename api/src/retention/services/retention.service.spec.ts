import { GenerationService } from "../../generation/services/generation.service";
import { PhotosService } from "../../photos/services/photos.service";
import { UsersService } from "../../users/services/users.service";
import { RetentionService } from "./retention.service";

describe("RetentionService", () => {
  const users = {
    findInactiveSince: jest.fn(),
  } as unknown as jest.Mocked<UsersService>;

  const photos = {
    list: jest.fn(),
    remove: jest.fn(),
  } as unknown as jest.Mocked<PhotosService>;

  const generation = {
    deleteResultsForPhoto: jest.fn(),
  } as unknown as jest.Mocked<GenerationService>;

  const buildService = (): RetentionService =>
    new RetentionService(users, photos, generation);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does nothing when there are no inactive users", async () => {
    users.findInactiveSince.mockResolvedValue([]);

    await buildService().cleanupInactiveUsers();

    expect(photos.list).not.toHaveBeenCalled();
    expect(generation.deleteResultsForPhoto).not.toHaveBeenCalled();
    expect(photos.remove).not.toHaveBeenCalled();
  });

  it("deletes generation results before the photo, for every photo of every inactive user", async () => {
    users.findInactiveSince.mockResolvedValue([
      { id: "user-1" },
      { id: "user-2" },
    ] as never);
    photos.list.mockImplementation((userId: string) =>
      Promise.resolve(
        userId === "user-1"
          ? ([{ id: "photo-1" }, { id: "photo-2" }] as never)
          : ([{ id: "photo-3" }] as never),
      ),
    );

    const callOrder: string[] = [];
    generation.deleteResultsForPhoto.mockImplementation(async (photoId) => {
      callOrder.push(`deleteResults:${photoId}`);
    });
    photos.remove.mockImplementation(async (_userId, photoId) => {
      callOrder.push(`removePhoto:${photoId}`);
    });

    await buildService().cleanupInactiveUsers();

    expect(generation.deleteResultsForPhoto).toHaveBeenCalledTimes(3);
    expect(photos.remove).toHaveBeenCalledWith("user-1", "photo-1");
    expect(photos.remove).toHaveBeenCalledWith("user-1", "photo-2");
    expect(photos.remove).toHaveBeenCalledWith("user-2", "photo-3");
    expect(callOrder).toEqual([
      "deleteResults:photo-1",
      "removePhoto:photo-1",
      "deleteResults:photo-2",
      "removePhoto:photo-2",
      "deleteResults:photo-3",
      "removePhoto:photo-3",
    ]);
  });

  it("skips users with no photos without error", async () => {
    users.findInactiveSince.mockResolvedValue([{ id: "user-1" }] as never);
    photos.list.mockResolvedValue([]);

    await expect(buildService().cleanupInactiveUsers()).resolves.not.toThrow();

    expect(generation.deleteResultsForPhoto).not.toHaveBeenCalled();
    expect(photos.remove).not.toHaveBeenCalled();
  });
});
