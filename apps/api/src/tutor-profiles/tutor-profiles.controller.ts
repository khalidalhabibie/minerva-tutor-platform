import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Put,
  Query,
  UseGuards
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse
} from "@nestjs/swagger";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AuthTokenPayload } from "../auth/types/auth-token-payload";
import { ListTutorProfilesQueryDto } from "./dto/list-tutor-profiles-query.dto";
import { PaginatedTutorProfilesResponseDto } from "./dto/paginated-tutor-profiles-response.dto";
import { TutorProfileResponseDto } from "./dto/tutor-profile-response.dto";
import { UpsertTutorProfileDto } from "./dto/upsert-tutor-profile.dto";
import { TutorProfilesService } from "./tutor-profiles.service";

@ApiTags("tutor-profiles")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class TutorProfilesController {
  constructor(
    @Inject(TutorProfilesService)
    private readonly tutorProfilesService: TutorProfilesService
  ) {}

  @Get("tutor-profiles")
  @ApiOperation({ summary: "Browse tutor profiles as a parent" })
  @ApiOkResponse({ type: PaginatedTutorProfilesResponseDto })
  @ApiBadRequestResponse({ description: "Invalid query parameters" })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({ description: "Only parents can browse tutor profiles" })
  listTutorProfiles(
    @CurrentUser() user: AuthTokenPayload,
    @Query() query: ListTutorProfilesQueryDto
  ): Promise<PaginatedTutorProfilesResponseDto> {
    return this.tutorProfilesService.listTutorProfiles(user, query);
  }

  @Get("tutor-profiles/:id")
  @ApiOperation({ summary: "View a tutor profile" })
  @ApiOkResponse({ type: TutorProfileResponseDto })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({ description: "Authenticated user cannot view profile" })
  @ApiNotFoundResponse({ description: "Tutor profile not found" })
  getTutorProfile(
    @CurrentUser() user: AuthTokenPayload,
    @Param("id") id: string
  ): Promise<TutorProfileResponseDto> {
    return this.tutorProfilesService.getTutorProfile(user, id);
  }

  @Get("tutor-profile/me")
  @ApiOperation({ summary: "Get the current tutor's own profile" })
  @ApiOkResponse({ type: TutorProfileResponseDto })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({ description: "Only tutors can access this endpoint" })
  @ApiNotFoundResponse({ description: "Tutor profile not found" })
  getMyTutorProfile(
    @CurrentUser() user: AuthTokenPayload
  ): Promise<TutorProfileResponseDto> {
    return this.tutorProfilesService.getMyTutorProfile(user);
  }

  @Put("tutor-profile/me")
  @ApiOperation({ summary: "Create or update the current tutor's own profile" })
  @ApiBody({ type: UpsertTutorProfileDto })
  @ApiOkResponse({ type: TutorProfileResponseDto })
  @ApiBadRequestResponse({ description: "Invalid request body" })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({ description: "Only tutors can access this endpoint" })
  upsertMyTutorProfile(
    @CurrentUser() user: AuthTokenPayload,
    @Body() body: UpsertTutorProfileDto
  ): Promise<TutorProfileResponseDto> {
    return this.tutorProfilesService.upsertMyTutorProfile(user, body);
  }
}
