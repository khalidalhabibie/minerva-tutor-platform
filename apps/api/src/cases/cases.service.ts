import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import {
  CaseInvitation,
  Prisma,
  TuitionCase,
  TuitionCaseStatus,
  UserRole
} from "@prisma/client";
import { AccessControlService } from "../access-control/access-control.service";
import { AuthTokenPayload } from "../auth/types/auth-token-payload";
import { PrismaService } from "../prisma/prisma.service";
import { CaseResponseDto } from "./dto/case-response.dto";
import { CreateCaseDto } from "./dto/create-case.dto";
import { CreateInvitationDto } from "./dto/create-invitation.dto";
import { InvitationResponseDto } from "./dto/invitation-response.dto";
import { ListCasesQueryDto } from "./dto/list-cases-query.dto";
import { PaginatedCasesResponseDto } from "./dto/paginated-cases-response.dto";
import { UpdateCaseDto } from "./dto/update-case.dto";

@Injectable()
export class CasesService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
    @Inject(AccessControlService)
    private readonly accessControl: AccessControlService
  ) {}

  async createCase(
    user: AuthTokenPayload,
    dto: CreateCaseDto
  ): Promise<CaseResponseDto> {
    if (user.role !== UserRole.PARENT) {
      throw new ForbiddenException("Only parents can create tuition cases");
    }

    const tuitionCase = await this.prisma.tuitionCase.create({
      data: {
        ownerId: user.sub,
        title: dto.title,
        subject: dto.subject,
        level: dto.level,
        location: dto.location,
        budgetPerHour: dto.budgetPerHour,
        status: TuitionCaseStatus.OPEN
      }
    });

    return this.toCaseResponse(tuitionCase);
  }

  async listCases(
    user: AuthTokenPayload,
    query: ListCasesQueryDto
  ): Promise<PaginatedCasesResponseDto> {
    const page = Number(query.page ?? 1);
    const pageSize = Number(query.pageSize ?? 20);
    const where = this.buildCaseListWhere(user, query);

    const [total, cases] = await this.prisma.$transaction([
      this.prisma.tuitionCase.count({ where }),
      this.prisma.tuitionCase.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize
      })
    ]);

    return {
      data: cases.map((tuitionCase) => this.toCaseResponse(tuitionCase)),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  }

  async getCase(
    user: AuthTokenPayload,
    caseId: string
  ): Promise<CaseResponseDto> {
    const tuitionCase = await this.findCaseOrThrow(caseId);

    if (!(await this.accessControl.canAccessCase(user, caseId))) {
      throw new ForbiddenException("You do not have access to this case");
    }

    return this.toCaseResponse(tuitionCase);
  }

  async updateCase(
    user: AuthTokenPayload,
    caseId: string,
    dto: UpdateCaseDto
  ): Promise<CaseResponseDto> {
    await this.findCaseOrThrow(caseId);

    if (!(await this.accessControl.canEditCase(user, caseId))) {
      throw new ForbiddenException("You cannot edit this case");
    }

    const tuitionCase = await this.prisma.tuitionCase.update({
      where: { id: caseId },
      data: dto
    });

    return this.toCaseResponse(tuitionCase);
  }

  async createInvitation(
    user: AuthTokenPayload,
    caseId: string,
    dto: CreateInvitationDto
  ): Promise<InvitationResponseDto> {
    await this.assertCanManageInvitations(user, caseId);
    await this.assertTutorTarget(dto.tutorId);

    const invitation = await this.prisma.caseInvitation.upsert({
      where: {
        caseId_tutorId: {
          caseId,
          tutorId: dto.tutorId
        }
      },
      update: {
        revokedAt: null
      },
      create: {
        caseId,
        tutorId: dto.tutorId
      }
    });

    return this.toInvitationResponse(invitation);
  }

  async listInvitations(
    user: AuthTokenPayload,
    caseId: string
  ): Promise<InvitationResponseDto[]> {
    await this.assertCanManageInvitations(user, caseId);

    const invitations = await this.prisma.caseInvitation.findMany({
      where: { caseId },
      orderBy: { createdAt: "desc" }
    });

    return invitations.map((invitation) =>
      this.toInvitationResponse(invitation)
    );
  }

  async revokeInvitation(
    user: AuthTokenPayload,
    caseId: string,
    tutorId: string
  ): Promise<InvitationResponseDto> {
    await this.assertCanManageInvitations(user, caseId);

    const invitation = await this.prisma.caseInvitation.findUnique({
      where: {
        caseId_tutorId: {
          caseId,
          tutorId
        }
      }
    });

    if (!invitation) {
      throw new NotFoundException("Invitation not found");
    }

    const revokedInvitation = await this.prisma.caseInvitation.update({
      where: {
        caseId_tutorId: {
          caseId,
          tutorId
        }
      },
      data: {
        revokedAt: new Date()
      }
    });

    return this.toInvitationResponse(revokedInvitation);
  }

  private buildCaseListWhere(
    user: AuthTokenPayload,
    query: ListCasesQueryDto
  ): Prisma.TuitionCaseWhereInput {
    const where: Prisma.TuitionCaseWhereInput = {};

    if (user.role === UserRole.PARENT) {
      where.ownerId = user.sub;
    } else if (user.role === UserRole.TUTOR) {
      where.invitations = {
        some: {
          tutorId: user.sub,
          revokedAt: null
        }
      };
    } else {
      where.id = "__no_access__";
    }

    if (query.search) {
      where.title = {
        contains: query.search,
        mode: "insensitive"
      };
    }

    if (query.subject) {
      where.subject = query.subject;
    }

    if (query.level) {
      where.level = query.level;
    }

    if (query.status) {
      where.status = query.status;
    }

    return where;
  }

  private async assertCanManageInvitations(
    user: AuthTokenPayload,
    caseId: string
  ): Promise<void> {
    await this.findCaseOrThrow(caseId);

    if (!(await this.accessControl.canManageCaseInvitations(user, caseId))) {
      throw new ForbiddenException("You cannot manage invitations for this case");
    }
  }

  private async assertTutorTarget(tutorId: string): Promise<void> {
    const tutor = await this.prisma.user.findFirst({
      where: {
        id: tutorId,
        role: UserRole.TUTOR
      },
      select: { id: true }
    });

    if (!tutor) {
      throw new BadRequestException("Invitation target must be a tutor");
    }
  }

  private async findCaseOrThrow(caseId: string): Promise<TuitionCase> {
    const tuitionCase = await this.prisma.tuitionCase.findUnique({
      where: { id: caseId }
    });

    if (!tuitionCase) {
      throw new NotFoundException("Case not found");
    }

    return tuitionCase;
  }

  private toCaseResponse(tuitionCase: TuitionCase): CaseResponseDto {
    return {
      id: tuitionCase.id,
      ownerId: tuitionCase.ownerId,
      title: tuitionCase.title,
      subject: tuitionCase.subject,
      level: tuitionCase.level,
      location: tuitionCase.location,
      budgetPerHour: Number(tuitionCase.budgetPerHour),
      status: tuitionCase.status,
      createdAt: tuitionCase.createdAt,
      updatedAt: tuitionCase.updatedAt
    };
  }

  private toInvitationResponse(
    invitation: CaseInvitation
  ): InvitationResponseDto {
    return {
      id: invitation.id,
      caseId: invitation.caseId,
      tutorId: invitation.tutorId,
      createdAt: invitation.createdAt,
      revokedAt: invitation.revokedAt
    };
  }
}
