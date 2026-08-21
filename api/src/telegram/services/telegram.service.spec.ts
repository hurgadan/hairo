import { ConfigService } from "@nestjs/config";

import { AppConfig } from "../../_common/types";
import { Locale } from "../../_contracts/users/enums/locale.enum";
import { UsersService } from "../../users/services/users.service";
import { HandlersService } from "./handlers.service";
import { MessagesService } from "./messages.service";
import { TelegramService } from "./telegram.service";

const sendMessage = jest.fn();
const start = jest.fn();
const stop = jest.fn();

jest.mock("grammy", () => ({
  Bot: jest.fn().mockImplementation(() => ({
    api: { sendMessage },
    start,
    stop,
  })),
}));

describe("TelegramService", () => {
  const handlers = { register: jest.fn() } as unknown as jest.Mocked<HandlersService>;
  const messages = new MessagesService();
  const users = { findById: jest.fn() } as unknown as jest.Mocked<UsersService>;

  const buildService = (token: string): TelegramService => {
    const config = {
      get: jest.fn().mockReturnValue(token),
    } as unknown as ConfigService<AppConfig, true>;

    return new TelegramService(config, handlers, messages, users);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    start.mockResolvedValue(undefined);
    sendMessage.mockResolvedValue(undefined);
  });

  it("notifies a telegram user in their language", async () => {
    users.findById.mockResolvedValue({
      id: "user-1",
      telegramId: "777",
      locale: Locale.De,
    } as never);

    await buildService("token").notifyGenerationReady("user-1");

    expect(sendMessage).toHaveBeenCalledTimes(1);
    const [chatId, text] = sendMessage.mock.calls[0];
    expect(chatId).toBe("777");
    expect(text).toContain("Ihr neuer Look ist fertig");
  });

  it("says nothing to a web-only account", async () => {
    users.findById.mockResolvedValue({
      id: "user-1",
      telegramId: null,
      locale: Locale.Ru,
    } as never);

    await buildService("token").notifyGenerationReady("user-1");

    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("stays offline without a token and never looks the user up", async () => {
    const service = buildService("");
    service.onModuleInit();

    await service.notifyGenerationReady("user-1");

    expect(start).not.toHaveBeenCalled();
    expect(handlers.register).not.toHaveBeenCalled();
    expect(users.findById).not.toHaveBeenCalled();
  });

  it("swallows a delivery failure — the generation already succeeded", async () => {
    users.findById.mockResolvedValue({
      id: "user-1",
      telegramId: "777",
      locale: Locale.Ru,
    } as never);
    sendMessage.mockRejectedValue(new Error("bot was blocked by the user"));

    await expect(
      buildService("token").notifyGenerationReady("user-1"),
    ).resolves.toBeUndefined();
  });

  it("does not await polling — that promise only settles on stop", () => {
    const service = buildService("token");
    // Зависший `start()` не должен мешать приложению закончить инициализацию.
    start.mockReturnValue(new Promise(() => {}));

    expect(() => service.onModuleInit()).not.toThrow();
    expect(start).toHaveBeenCalledTimes(1);
  });
});
