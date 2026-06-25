import { Inject, Injectable } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { AuthTokenPayload } from "../auth/types/auth-token-payload";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AccessControlService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async canAccessCase(user: AuthTokenPayload, caseId: string): Promise<boolean> {
    if (user.role === UserRole.PARENT) {
      return this.exists(
        this.prisma.tuitionCase.findFirst({
          where: {
            id: caseId,
            ownerId: user.sub
          },
          select: { id: true }
        })
      );
    }

    if (user.role === UserRole.TUTOR) {
      return this.exists(
        this.prisma.caseInvitation.findFirst({
          where: {
            caseId,
            tutorId: user.sub,
            revokedAt: null
          },
          select: { id: true }
        })
      );
    }

    return false;
  }

  async canEditCase(user: AuthTokenPayload, caseId: string): Promise<boolean> {
    if (user.role !== UserRole.PARENT) {
      return false;
    }

    return this.exists(
      this.prisma.tuitionCase.findFirst({
        where: {
          id: caseId,
          ownerId: user.sub
        },
        select: { id: true }
      })
    );
  }

  async canManageCaseInvitations(
    user: AuthTokenPayload,
    caseId: string
  ): Promise<boolean> {
    return this.canEditCase(user, caseId);
  }

  async canAccessDocument(
    user: AuthTokenPayload,
    documentId: string
  ): Promise<boolean> {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      select: {
        caseId: true,
        tutorProfileId: true
      }
    });

    if (!document) {
      return false;
    }

    if (document.caseId) {
      return this.canAccessCase(user, document.caseId);
    }

    if (document.tutorProfileId) {
      return this.canViewTutorProfile(user, document.tutorProfileId);
    }

    return false;
  }

  canEditOwnTutorProfile(
    user: AuthTokenPayload,
    profileUserId: string
  ): boolean {
    return user.role === UserRole.TUTOR && user.sub === profileUserId;
  }

  async canViewTutorProfile(
    user: AuthTokenPayload,
    profileId: string
  ): Promise<boolean> {
    if (user.role === UserRole.PARENT) {
      return this.exists(
        this.prisma.tutorProfile.findUnique({
          where: { id: profileId },
          select: { id: true }
        })
      );
    }

    if (user.role === UserRole.TUTOR) {
      return this.exists(
        this.prisma.tutorProfile.findFirst({
          where: {
            id: profileId,
            userId: user.sub
          },
          select: { id: true }
        })
      );
    }

    return false;
  }

  private async exists<T>(query: Promise<T | null>): Promise<boolean> {
    return (await query) !== null;
  }
}
