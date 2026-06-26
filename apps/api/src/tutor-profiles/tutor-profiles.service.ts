import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { Prisma, TutorProfile, UserRole } from "@prisma/client";
import { AccessControlService } from "../access-control/access-control.service";
import { AuthTokenPayload } from "../auth/types/auth-token-payload";
import { PrismaService } from "../prisma/prisma.service";
import { ListTutorProfilesQueryDto } from "./dto/list-tutor-profiles-query.dto";
import { PaginatedTutorProfilesResponseDto } from "./dto/paginated-tutor-profiles-response.dto";
import { TutorProfileResponseDto } from "./dto/tutor-profile-response.dto";
import { UpsertTutorProfileDto } from "./dto/upsert-tutor-profile.dto";

@Injectable()
export class TutorProfilesService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
    @Inject(AccessControlService)
    private readonly accessControl: AccessControlService
  ) {}

  async listTutorProfiles(
    user: AuthTokenPayload,
    query: ListTutorProfilesQueryDto
  ): Promise<PaginatedTutorProfilesResponseDto> {
    if (user.role !== UserRole.PARENT) {
      throw new ForbiddenException("Only parents can browse tutor profiles");
    }

    const page = Number(query.page ?? 1);
    const pageSize = Number(query.pageSize ?? 20);
    const where = this.buildListWhere(query);

    const [total, profiles] = await this.prisma.$transaction([
      this.prisma.tutorProfile.count({ where }),
      this.prisma.tutorProfile.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize
      })
    ]);

    return {
      data: profiles.map((profile) => this.toProfileResponse(profile)),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  }

  async getTutorProfile(
    user: AuthTokenPayload,
    profileId: string
  ): Promise<TutorProfileResponseDto> {
    const profile = await this.findProfileOrThrow(profileId);

    if (!(await this.accessControl.canViewTutorProfile(user, profileId))) {
      throw new ForbiddenException("You cannot view this tutor profile");
    }

    return this.toProfileResponse(profile);
  }

  async getMyTutorProfile(
    user: AuthTokenPayload
  ): Promise<TutorProfileResponseDto> {
    this.assertTutor(user);

    const profile = await this.prisma.tutorProfile.findUnique({
      where: { userId: user.sub }
    });

    if (!profile) {
      throw new NotFoundException("Tutor profile not found");
    }

    return this.toProfileResponse(profile);
  }

  async upsertMyTutorProfile(
    user: AuthTokenPayload,
    dto: UpsertTutorProfileDto
  ): Promise<TutorProfileResponseDto> {
    this.assertTutor(user);

    const profile = await this.prisma.tutorProfile.upsert({
      where: { userId: user.sub },
      update: {
        displayName: dto.displayName,
        qualifications: dto.qualifications,
        experiences: dto.experiences
      },
      create: {
        userId: user.sub,
        displayName: dto.displayName,
        qualifications: dto.qualifications,
        experiences: dto.experiences
      }
    });

    return this.toProfileResponse(profile);
  }

  private buildListWhere(
    query: ListTutorProfilesQueryDto
  ): Prisma.TutorProfileWhereInput {
    if (!query.search) {
      return {};
    }

    return {
      OR: [
        {
          displayName: {
            contains: query.search,
            mode: "insensitive"
          }
        },
        {
          qualifications: {
            contains: query.search,
            mode: "insensitive"
          }
        },
        {
          experiences: {
            contains: query.search,
            mode: "insensitive"
          }
        }
      ]
    };
  }

  private async findProfileOrThrow(profileId: string): Promise<TutorProfile> {
    const profile = await this.prisma.tutorProfile.findUnique({
      where: { id: profileId }
    });

    if (!profile) {
      throw new NotFoundException("Tutor profile not found");
    }

    return profile;
  }

  private assertTutor(user: AuthTokenPayload): void {
    if (user.role !== UserRole.TUTOR) {
      throw new ForbiddenException("Only tutors can manage their own profile");
    }
  }

  private toProfileResponse(profile: TutorProfile): TutorProfileResponseDto {
    return {
      id: profile.id,
      userId: profile.userId,
      displayName: profile.displayName,
      qualifications: profile.qualifications,
      experiences: profile.experiences,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt
    };
  }
}
