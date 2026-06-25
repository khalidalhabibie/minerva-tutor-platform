import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  UseGuards
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./current-user.decorator";
import { AuthUserDto } from "./dto/auth-user.dto";
import { LoginDto } from "./dto/login.dto";
import { LoginResponseDto } from "./dto/login-response.dto";
import { LogoutResponseDto } from "./dto/logout-response.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { AuthTokenPayload } from "./types/auth-token-payload";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post("login")
  @HttpCode(200)
  @ApiOperation({ summary: "Log in with email and password" })
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiBadRequestResponse({ description: "Invalid request body" })
  @ApiUnauthorizedResponse({ description: "Invalid email or password" })
  async login(@Body() body: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(body.email, body.password);
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Log out from a client-managed JWT session" })
  @ApiOkResponse({ type: LogoutResponseDto })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  logout(): LogoutResponseDto {
    return { ok: true };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get the current authenticated user" })
  @ApiOkResponse({ type: AuthUserDto })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  async me(@CurrentUser() user: AuthTokenPayload): Promise<AuthUserDto> {
    return this.authService.getCurrentUser(user.sub);
  }
}
