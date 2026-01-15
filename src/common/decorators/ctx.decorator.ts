import { ExecutionContext, UnauthorizedException, createParamDecorator } from "@nestjs/common";

import { RequestContext } from "../interfaces/request-context.interface";

export const Ctx = createParamDecorator((_data: unknown, ctx: ExecutionContext): RequestContext<unknown> => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user;

  if (!user || !user.id) {
    throw new UnauthorizedException("Utilisateur non identifié");
  }

  return {
    userId: user.id,
    method: ctx.getHandler().name,
    input: request.body,
  };
});
