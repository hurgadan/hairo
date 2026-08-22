import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";

import type { AppConfig } from "../_common/types";
import { BillingModule } from "../billing/billing.module";
import { MailModule } from "../mail/mail.module";
import { UsersModule } from "../users/users.module";
import { AuthController } from "./controllers/auth.controller";
import { EmailOtpCode } from "./dao/email-otp-code.entity";
import { OtpRepository } from "./repositories/otp.repository";
import { AuthService } from "./services/auth.service";
import { OtpService } from "./services/otp.service";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailOtpCode]),
    UsersModule,
    BillingModule,
    // MailModule глобальный, но зависимость объявляем явно: иначе тестовый
    // модуль, собранный без корневого AppModule, не увидит MailService.
    MailModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) => ({
        secret: configService.get("jwtSecret", { infer: true }),
        signOptions: {
          expiresIn: configService.get("jwtExpiresIn", { infer: true }),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, OtpService, OtpRepository, JwtStrategy],
  // AuthService нужен боту: `/start` — это вход, и заводить учётку он обязан
  // тем же путём, что и Mini App, а не своей копией логики.
  exports: [AuthService],
})
export class AuthModule {}
