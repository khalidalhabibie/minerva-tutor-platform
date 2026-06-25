import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { AuthTokenPayload } from "./types/auth-token-payload";
import { AuthenticatedRequest } from "./types/authenticated-request";

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthTokenPayload => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  }
);
