import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Bot } from "grammy";

import { AppConfig } from "../../_common/types";
import { UsersService } from "../../users/services/users.service";
import { HandlersService } from "./handlers.service";
import { MessagesService } from "./messages.service";

/**
 * Жизненный цикл бота: long polling в dev (`TECH.md`), вебхук появится вместе
 * с публичным доменом. Без `TELEGRAM_BOT_TOKEN` бот не поднимается вовсе —
 * приложение и тесты работают как раньше, уведомления просто не уходят.
 */
@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramService.name);
  private readonly bot: Bot | null;

  constructor(
    private readonly config: ConfigService<AppConfig, true>,
    private readonly handlers: HandlersService,
    private readonly messages: MessagesService,
    private readonly users: UsersService,
  ) {
    const token = this.config.get("telegramBotToken", { infer: true });
    this.bot = token ? new Bot(token) : null;

    if (this.bot) {
      this.handlers.register(this.bot);
    }
  }

  public onModuleInit(): void {
    if (!this.bot) {
      this.logger.warn("TELEGRAM_BOT_TOKEN is empty — the bot stays offline");
      return;
    }

    // `start()` резолвится только когда поллинг остановлен, поэтому его нельзя
    // ждать здесь: иначе приложение никогда не закончит инициализацию.
    void this.bot
      .start({
        onStart: (me) => this.logger.log(`bot @${me.username} is polling`),
      })
      .catch((error: unknown) => {
        this.logger.error(
          "polling stopped",
          error instanceof Error ? error.stack : error,
        );
      });
  }

  public async onModuleDestroy(): Promise<void> {
    await this.bot?.stop();
  }

  /**
   * Уведомление о готовой генерации. Тихо ничего не делает, если бот выключен
   * или у пользователя нет Telegram (вебовая учётка) — и никогда не бросает:
   * генерация уже удалась, и падать из-за недоставленного сообщения незачем.
   */
  public async notifyGenerationReady(userId: string): Promise<void> {
    if (!this.bot) return;

    try {
      const user = await this.users.findById(userId);
      if (!user?.telegramId) return;

      await this.bot.api.sendMessage(
        user.telegramId,
        this.messages.renderGenerationReady(user.locale),
      );
    } catch (error) {
      this.logger.error(
        `failed to notify user ${userId}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }
}
