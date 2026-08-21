import { Injectable, Logger } from "@nestjs/common";
import { Bot, Context } from "grammy";

import { Locale } from "../../_contracts/users/enums/locale.enum";
import { FALLBACK_LOCALE } from "../../_common/utils/localized-templates";
import { AuthService } from "../../auth/services/auth.service";
import { BillingService } from "../../billing/services/billing.service";
import { TELEGRAM_LANGUAGE_CODES } from "../constants";
import { MessagesService } from "./messages.service";

/**
 * grammY-хендлеры вместо HTTP-контроллеров — у модуля `telegram` их нет
 * (`ARCHITECTURE.md` §2). Логика живёт в доменных сервисах, здесь только
 * разбор апдейта и ответ.
 */
@Injectable()
export class HandlersService {
  private readonly logger = new Logger(HandlersService.name);

  constructor(
    private readonly auth: AuthService,
    private readonly billing: BillingService,
    private readonly messages: MessagesService,
  ) {}

  public register(bot: Bot): void {
    bot.command("start", (ctx) => this.onStart(ctx));

    bot.catch((error) => {
      // Иначе grammY пробрасывает ошибку дальше и роняет поллинг.
      this.logger.error(
        `update ${error.ctx.update.update_id} failed`,
        error.error instanceof Error ? error.error.stack : error.error,
      );
    });
  }

  /**
   * `/start` — это и есть вход: апдейт пришёл от Telegram на наш токен, значит
   * пользователю можно верить. Учётка заводится или обновляется, при заведении
   * начисляется trial — той же дорогой, что и вход из Mini App.
   */
  private async onStart(ctx: Context): Promise<void> {
    const from = ctx.from;
    if (!from) return;

    const { user } = await this.auth.loginWithTelegramUser({
      telegramId: String(from.id),
      telegramUsername: from.username ?? null,
      firstName: from.first_name ?? null,
      lastName: from.last_name ?? null,
      locale: toLocale(from.language_code),
    });

    const balance = await this.billing.getBalance(user.id);

    await ctx.reply(
      this.messages.renderStart(user.locale, {
        name: user.firstName,
        balance,
      }),
    );
  }
}

/** Язык Telegram-клиента → наша локаль; чужие языки уходят в фолбэк. */
function toLocale(languageCode?: string): Locale {
  const code = languageCode?.slice(0, 2).toLowerCase();
  return TELEGRAM_LANGUAGE_CODES.find((supported) => supported === code)
    ? (code as Locale)
    : FALLBACK_LOCALE;
}
