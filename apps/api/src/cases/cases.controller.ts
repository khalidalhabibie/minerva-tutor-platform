import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
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
import { CasesService } from "./cases.service";
import { CaseResponseDto } from "./dto/case-response.dto";
import { CreateCaseDto } from "./dto/create-case.dto";
import { CreateInvitationDto } from "./dto/create-invitation.dto";
import { InvitationResponseDto } from "./dto/invitation-response.dto";
import { ListCasesQueryDto } from "./dto/list-cases-query.dto";
import { PaginatedCasesResponseDto } from "./dto/paginated-cases-response.dto";
import { UpdateCaseDto } from "./dto/update-case.dto";

@ApiTags("cases")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("cases")
export class CasesController {
  constructor(@Inject(CasesService) private readonly casesService: CasesService) {}

  @Post()
  @ApiOperation({ summary: "Create a tuition case as a parent" })
  @ApiBody({ type: CreateCaseDto })
  @ApiCreatedResponse({ type: CaseResponseDto })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({ description: "Only parents can create cases" })
  createCase(
    @CurrentUser() user: AuthTokenPayload,
    @Body() body: CreateCaseDto
  ): Promise<CaseResponseDto> {
    return this.casesService.createCase(user, body);
  }

  @Get()
  @ApiOperation({ summary: "List accessible tuition cases" })
  @ApiOkResponse({ type: PaginatedCasesResponseDto })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  listCases(
    @CurrentUser() user: AuthTokenPayload,
    @Query() query: ListCasesQueryDto
  ): Promise<PaginatedCasesResponseDto> {
    return this.casesService.listCases(user, query);
  }

  @Get(":id")
  @ApiOperation({ summary: "View an accessible tuition case" })
  @ApiOkResponse({ type: CaseResponseDto })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({ description: "Authenticated user cannot access case" })
  @ApiNotFoundResponse({ description: "Case not found" })
  getCase(
    @CurrentUser() user: AuthTokenPayload,
    @Param("id") id: string
  ): Promise<CaseResponseDto> {
    return this.casesService.getCase(user, id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Edit a case as the parent owner" })
  @ApiBody({ type: UpdateCaseDto })
  @ApiOkResponse({ type: CaseResponseDto })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({ description: "Only the parent owner can edit a case" })
  @ApiNotFoundResponse({ description: "Case not found" })
  updateCase(
    @CurrentUser() user: AuthTokenPayload,
    @Param("id") id: string,
    @Body() body: UpdateCaseDto
  ): Promise<CaseResponseDto> {
    return this.casesService.updateCase(user, id, body);
  }

  @Post(":id/invitations")
  @ApiOperation({ summary: "Invite a tutor to a case as the parent owner" })
  @ApiBody({ type: CreateInvitationDto })
  @ApiCreatedResponse({ type: InvitationResponseDto })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({ description: "Only the parent owner can invite tutors" })
  @ApiNotFoundResponse({ description: "Case not found" })
  createInvitation(
    @CurrentUser() user: AuthTokenPayload,
    @Param("id") id: string,
    @Body() body: CreateInvitationDto
  ): Promise<InvitationResponseDto> {
    return this.casesService.createInvitation(user, id, body);
  }

  @Get(":id/invitations")
  @ApiOperation({ summary: "List invitations for a case as the parent owner" })
  @ApiOkResponse({ type: [InvitationResponseDto] })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({ description: "Only the parent owner can view invitations" })
  @ApiNotFoundResponse({ description: "Case not found" })
  listInvitations(
    @CurrentUser() user: AuthTokenPayload,
    @Param("id") id: string
  ): Promise<InvitationResponseDto[]> {
    return this.casesService.listInvitations(user, id);
  }

  @Delete(":id/invitations/:tutorId")
  @HttpCode(200)
  @ApiOperation({ summary: "Soft revoke a tutor invitation as the parent owner" })
  @ApiOkResponse({ type: InvitationResponseDto })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({ description: "Only the parent owner can revoke invitations" })
  @ApiNotFoundResponse({ description: "Case or invitation not found" })
  revokeInvitation(
    @CurrentUser() user: AuthTokenPayload,
    @Param("id") id: string,
    @Param("tutorId") tutorId: string
  ): Promise<InvitationResponseDto> {
    return this.casesService.revokeInvitation(user, id, tutorId);
  }
}
