import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { User, UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { AuthenticatedRequest } from "./types/authenticated-request";

const now = new Date("2026-06-25T00:00:00.000Z");

const configService = {
  getOrThrow: jest.fn((key: string) => {
    const values: Record<string, string> = {
      JWT_SECRET: "test-jwt-secret",
      JWT_EXPIRES_IN: "1h"
    };

    return values[key];
  })
} as unknown as ConfigService;

type PrismaMock = {
  user: {
    findUnique: jest.Mock<Promise<User | null>, [{ where: { email?: string; id?: string } }]>;
  };
};

function createExecutionContext(request: Partial<AuthenticatedRequest>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request
    })
  } as ExecutionContext;
}

describe("AuthController", () => {
  let prisma: PrismaMock;
  let authService: AuthService;
  let authController: AuthController;
  let jwtAuthGuard: JwtAuthGuard;
  let testUser: User;

  beforeAll(async () => {
    testUser = {
      id: "user-parent-1",
      email: "parent@example.com",
      passwordHash: await bcrypt.hash("Password123!", 12),
      role: UserRole.PARENT,
      createdAt: now,
      updatedAt: now
    };
  });

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn()
      }
    };

    const jwtService = new JwtService();
    authService = new AuthService(
      prisma as unknown as PrismaService,
      jwtService,
      configService
    );
    authController = new AuthController(authService);
    jwtAuthGuard = new JwtAuthGuard(jwtService, configService);
  });

  it("logs in with valid credentials", async () => {
    prisma.user.findUnique.mockResolvedValue(testUser);

    const response = await authController.login({
      email: "parent@example.com",
      password: "Password123!"
    });

    expect(response.accessToken).toEqual(expect.any(String));
    expect(response.user).toMatchObject({
      id: testUser.id,
      email: testUser.email,
      role: testUser.role
    });
    expect(response.user).not.toHaveProperty("passwordHash");
  });

  it("rejects a wrong password without revealing whether the email exists", async () => {
    prisma.user.findUnique.mockResolvedValue(testUser);

    await expect(
      authController.login({
        email: "parent@example.com",
        password: "wrong-password"
      })
    ).rejects.toMatchObject({
      response: {
        statusCode: 401,
        message: "Invalid email or password"
      }
    });
  });

  it("rejects /auth/me without a token", async () => {
    const request = {
      headers: {}
    };

    await expect(
      jwtAuthGuard.canActivate(createExecutionContext(request))
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("returns /auth/me with a valid token", async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce(testUser)
      .mockResolvedValueOnce(testUser);

    const loginResponse = await authController.login({
      email: "parent@example.com",
      password: "Password123!"
    });
    const request = {
      headers: {
        authorization: `Bearer ${loginResponse.accessToken}`
      }
    };

    await expect(jwtAuthGuard.canActivate(createExecutionContext(request))).resolves.toBe(
      true
    );

    const response = await authController.me(
      (request as AuthenticatedRequest).user
    );

    expect(response).toMatchObject({
      id: testUser.id,
      email: testUser.email,
      role: testUser.role
    });
    expect(response).not.toHaveProperty("passwordHash");
  });
});
