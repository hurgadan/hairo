import {
  Body,
  Controller,
  Get,
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
import { RegisterDto } from "../dto/register.dto";
import { TelegramAuthDto } from "../dto/telegram-auth.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { AuthService } from "../services/auth.service";
import type { AuthenticatedUser } from "../types/jwt-payload.type";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
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
