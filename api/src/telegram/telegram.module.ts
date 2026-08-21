import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { BillingModule } from "../billing/billing.module";
import { UsersModule } from "../users/users.module";
import { HandlersService } from "./services/handlers.service";
import { MessagesService } from "./services/messages.service";
import { TelegramService } from "./services/telegram.service";

@Module({
  imports: [AuthModule, BillingModule, UsersModule],
  providers: [TelegramService, HandlersService, MessagesService],
  exports: [TelegramService],
})
export class TelegramModule {}
