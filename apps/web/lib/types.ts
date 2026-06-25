export type UserRole = "PARENT" | "TUTOR";

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};

export type ApiError = Error & {
  status?: number;
  payload?: unknown;
};
