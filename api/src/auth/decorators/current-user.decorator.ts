import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import type { AuthenticatedUser } from "../types/jwt-payload.type";

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    return ctx.switchToHttp().getRequest<{ user: AuthenticatedUser }>().user;
  },
);
