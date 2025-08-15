import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import type { RequestUser } from "./auth.types";

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user as RequestUser | undefined;
  },
);
