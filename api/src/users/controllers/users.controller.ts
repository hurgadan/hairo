import {
  Body,
  Controller,
  NotFoundException,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { transformToDto } from "../../_common/utils/transform-to-dto";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import type { AuthenticatedUser } from "../../auth/types/jwt-payload.type";
import { UpdateUserDto } from "../dto/update-user.dto";
import { UserDto } from "../dto/user.dto";
import { UsersService } from "../services/users.service";

@ApiTags("users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Patch("me")
  public async updateMe(
    @CurrentUser() current: AuthenticatedUser,
    @Body() dto: UpdateUserDto,
  ): Promise<UserDto> {
    const user = await this.users.update(current.userId, dto);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return transformToDto(UserDto, user);
  }
}
