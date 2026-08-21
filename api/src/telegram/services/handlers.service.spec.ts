import { Bot, Context } from "grammy";

import { Locale } from "../../_contracts/users/enums/locale.enum";
import { AuthService } from "../../auth/services/auth.service";
import { BillingService } from "../../billing/services/billing.service";
import { HandlersService } from "./handlers.service";
import { MessagesService } from "./messages.service";

describe("HandlersService", () => {
  const auth = {
    loginWithTelegramUser: jest.fn(),
  } as unknown as jest.Mocked<AuthService>;

  const billing = {
    getBalance: jest.fn(),
  } as unknown as jest.Mocked<BillingService>;

  const messages = new MessagesService();

  const buildService = (): HandlersService =>
    new HandlersService(auth, billing, messages);

  /** Ловит хендлер, который сервис вешает на `/start`. */
  const captureStart = (): ((ctx: Context) => Promise<void>) => {
    let handler!: (ctx: Context) => Promise<void>;
    const bot = {
      command: jest.fn((_name: string, fn: (ctx: Context) => Promise<void>) => {
        handler = fn;
      }),
      catch: jest.fn(),
    } as unknown as Bot;

    buildService().register(bot);
    return handler;
  };

  const buildContext = (
    from: Record<string, unknown> | undefined,
  ): { ctx: Context; reply: jest.Mock } => {
    const reply = jest.fn().mockResolvedValue(undefined);
    return { ctx: { from, reply } as unknown as Context, reply };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    billing.getBalance.mockResolvedValue(1);
    auth.loginWithTelegramUser.mockResolvedValue({
      accessToken: "token",
      user: { id: "user-1", firstName: "Валерия", locale: Locale.Ru },
    } as never);
  });

  it("logs the sender in and greets them with their balance", async () => {
    const onStart = captureStart();
    const { ctx, reply } = buildContext({
      id: 777,
      username: "valeria",
      first_name: "Валерия",
      language_code: "ru",
    });

    await onStart(ctx);

    expect(auth.loginWithTelegramUser).toHaveBeenCalledWith({
      telegramId: "777",
      telegramUsername: "valeria",
      firstName: "Валерия",
      lastName: null,
      locale: Locale.Ru,
    });

    const text = reply.mock.calls[0][0] as string;
    expect(text).toContain("Валерия");
    expect(text).toContain("1");
  });

  it("takes the language from the telegram client", async () => {
    const onStart = captureStart();
    const { ctx } = buildContext({
      id: 42,
      first_name: "Hans",
      language_code: "de-DE",
    });

    await onStart(ctx);

    expect(auth.loginWithTelegramUser).toHaveBeenCalledWith(
      expect.objectContaining({ locale: Locale.De }),
    );
  });

  it("falls back to Russian for a language we do not speak", async () => {
    const onStart = captureStart();
    const { ctx } = buildContext({
      id: 43,
      first_name: "Pierre",
      language_code: "fr",
    });

    await onStart(ctx);

    expect(auth.loginWithTelegramUser).toHaveBeenCalledWith(
      expect.objectContaining({ locale: Locale.Ru }),
    );
  });

  it("answers in the language of the account, not of the client", async () => {
    // Пользователь сменил язык в вебе — бот обязан говорить на нём же.
    auth.loginWithTelegramUser.mockResolvedValue({
      accessToken: "token",
      user: { id: "user-1", firstName: "Hans", locale: Locale.De },
    } as never);

    const onStart = captureStart();
    const { ctx, reply } = buildContext({
      id: 44,
      first_name: "Hans",
      language_code: "ru",
    });

    await onStart(ctx);

    expect(reply.mock.calls[0][0]).toContain("Hallo");
  });

  it("ignores an update without a sender", async () => {
    const onStart = captureStart();
    const { ctx, reply } = buildContext(undefined);

    await onStart(ctx);

    expect(auth.loginWithTelegramUser).not.toHaveBeenCalled();
    expect(reply).not.toHaveBeenCalled();
  });
});
