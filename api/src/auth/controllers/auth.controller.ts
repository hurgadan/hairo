import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  NotFoundException,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { transformToDto } from "../../_common/utils/transform-to-dto";
import { UserDto } from "../../users/dto/user.dto";
import { UsersService } from "../../users/services/users.service";
import { CurrentUser } from "../decorators/current-user.decorator";
import { AuthResponseDto } from "../dto/auth-response.dto";
import { LoginDto } from "../dto/login.dto";
import { OtpRequestResultDto } from "../dto/otp-request-result.dto";
import { RegisterDto } from "../dto/register.dto";
import { RequestOtpDto } from "../dto/request-otp.dto";
import { TelegramAuthDto } from "../dto/telegram-auth.dto";
import { VerifyOtpDto } from "../dto/verify-otp.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { OptionalJwtAuthGuard } from "../guards/optional-jwt-auth.guard";
import { AuthService } from "../services/auth.service";
import { OtpService } from "../services/otp.service";
import type { AuthenticatedUser } from "../types/jwt-payload.type";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly otp: OtpService,
    private readonly users: UsersService,
  ) {}

  @Post("guest")
  public async guest(): Promise<AuthResponseDto> {
    return transformToDto(AuthResponseDto, await this.auth.loginAsGuest());
  }

  @Post("register")
  public async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return transformToDto(AuthResponseDto, await this.auth.register(dto));
  }

  @Post("login")
  public async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return transformToDto(AuthResponseDto, await this.auth.login(dto));
  }

  @Post("telegram")
  public async telegram(
    @Body() dto: TelegramAuthDto,
  ): Promise<AuthResponseDto> {
    return transformToDto(
      AuthResponseDto,
      await this.auth.loginWithTelegram(dto.initData),
    );
  }

  @Post("otp/request")
  @HttpCode(HttpStatus.OK)
  public async requestOtp(
    @Body() dto: RequestOtpDto,
    @Ip() ip: string,
  ): Promise<OtpRequestResultDto> {
    return transformToDto(
      OtpRequestResultDto,
      await this.otp.request({
        email: dto.email,
        locale: dto.locale,
        requestIp: ip || null,
      }),
    );
  }

  /**
   * Гостевой токен здесь необязателен: с ним гостевая учётка присваивается,
   * без него заводится новая (`PRODUCT.md` §4.3).
   */
  @Post("otp/verify")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  public async verifyOtp(
    @Body() dto: VerifyOtpDto,
    @CurrentUser() current: AuthenticatedUser | undefined,
  ): Promise<AuthResponseDto> {
    await this.otp.verify(dto.email, dto.code);

    return transformToDto(
      AuthResponseDto,
      await this.auth.loginWithOtp({
        email: dto.email,
        currentUserId: current?.userId,
      }),
    );
  }

  @Get("me")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  public async me(@CurrentUser() current: AuthenticatedUser): Promise<UserDto> {
    const user = await this.users.findById(current.userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return transformToDto(UserDto, user);
  }
}
