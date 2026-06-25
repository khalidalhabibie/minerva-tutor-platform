import { Request } from "express";
import { AuthTokenPayload } from "./auth-token-payload";

export type AuthenticatedRequest = Request & {
  user: AuthTokenPayload;
};
