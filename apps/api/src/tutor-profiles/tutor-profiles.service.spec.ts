import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { AccessControlService } from "../access-control/access-control.service";
import { AuthTokenPayload } from "../auth/types/auth-token-payload";
import { PrismaService } from "../prisma/prisma.service";
import { TutorProfilesService } from "./tutor-profiles.service";

type PrismaMock = {
  $transaction: jest.Mock;
  tutorProfile: {
    count: jest.Mock;
    findMany: jest.Mock;
    findUnique: jest.Mock;
    upsert: jest.Mock;
  };
};

type AccessControlMock = {
  canViewTutorProfile: jest.Mock;
};

const parent: AuthTokenPayload = {
  sub: "parent-1",
  role: UserRole.PARENT
};

const tutor: AuthTokenPayload = {
  sub: "tutor-1",
  role: UserRole.TUTOR
};

const otherTutor: AuthTokenPayload = {
  sub: "tutor-2",
  role: UserRole.TUTOR
};

const now = new Date("2026-06-25T00:00:00.000Z");

const profileRecord = {
  id: "profile-1",
  userId: "tutor-1",
  displayName: "Aisha Rahman",
  qualifications: "BSc Mathematics",
  experiences: "5 years tutoring secondary students",
  createdAt: now,
  updatedAt: now
};

describe("TutorProfilesService", () => {
  let prisma: PrismaMock;
  let accessControl: AccessControlMock;
  let service: TutorProfilesService;

  beforeEach(() => {
    prisma = {
      $transaction: jest.fn(async (queries: unknown[]) => Promise.all(queries)),
      tutorProfile: {
        count: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        upsert: jest.fn()
      }
    };
    accessControl = {
      canViewTutorProfile: jest.fn()
    };
    service = new TutorProfilesService(
      prisma as unknown as PrismaService,
      accessControl as unknown as AccessControlService
    );
  });

  it("allows parents to browse tutor profiles with search and pagination", async () => {
    prisma.tutorProfile.count.mockResolvedValue(1);
    prisma.tutorProfile.findMany.mockResolvedValue([profileRecord]);

    const result = await service.listTutorProfiles(parent, {
      page: 2,
      pageSize: 10,
      search: "math"
    });

    const expectedWhere = {
      OR: [
        {
          displayName: {
            contains: "math",
            mode: "insensitive"
          }
        },
        {
          qualifications: {
            contains: "math",
            mode: "insensitive"
          }
        },
        {
          experiences: {
            contains: "math",
            mode: "insensitive"
          }
        }
      ]
    };

    expect(prisma.tutorProfile.count).toHaveBeenCalledWith({
      where: expectedWhere
    });
    expect(prisma.tutorProfile.findMany).toHaveBeenCalledWith({
      where: expectedWhere,
      orderBy: { createdAt: "desc" },
      skip: 10,
      take: 10
    });
    expect(result).toEqual({
      data: [
        {
          id: "profile-1",
          userId: "tutor-1",
          displayName: "Aisha Rahman",
          qualifications: "BSc Mathematics",
          experiences: "5 years tutoring secondary students",
          createdAt: now,
          updatedAt: now
        }
      ],
      pagination: {
        page: 2,
        pageSize: 10,
        total: 1,
        totalPages: 1
      }
    });
  });

  it("denies tutors browsing the profile directory", async () => {
    await expect(
      service.listTutorProfiles(tutor, {
        page: 1,
        pageSize: 20
      })
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("allows tutors to view their own profile by id", async () => {
    prisma.tutorProfile.findUnique.mockResolvedValue(profileRecord);
    accessControl.canViewTutorProfile.mockResolvedValue(true);

    const result = await service.getTutorProfile(tutor, "profile-1");

    expect(accessControl.canViewTutorProfile).toHaveBeenCalledWith(
      tutor,
      "profile-1"
    );
    expect(result).toMatchObject({
      id: "profile-1",
      userId: "tutor-1"
    });
  });

  it("denies tutors viewing another tutor profile", async () => {
    prisma.tutorProfile.findUnique.mockResolvedValue({
      ...profileRecord,
      id: "profile-2",
      userId: "tutor-2"
    });
    accessControl.canViewTutorProfile.mockResolvedValue(false);

    await expect(
      service.getTutorProfile(tutor, "profile-2")
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("allows parents to view any tutor profile by id", async () => {
    prisma.tutorProfile.findUnique.mockResolvedValue(profileRecord);
    accessControl.canViewTutorProfile.mockResolvedValue(true);

    await expect(service.getTutorProfile(parent, "profile-1")).resolves.toMatchObject(
      {
        id: "profile-1"
      }
    );
  });

  it("returns a tutor's own profile through /me", async () => {
    prisma.tutorProfile.findUnique.mockResolvedValue(profileRecord);

    const result = await service.getMyTutorProfile(tutor);

    expect(prisma.tutorProfile.findUnique).toHaveBeenCalledWith({
      where: { userId: "tutor-1" }
    });
    expect(result).toMatchObject({
      id: "profile-1",
      userId: "tutor-1"
    });
  });

  it("returns 404 when a tutor has no own profile yet", async () => {
    prisma.tutorProfile.findUnique.mockResolvedValue(null);

    await expect(service.getMyTutorProfile(tutor)).rejects.toBeInstanceOf(
      NotFoundException
    );
  });

  it("denies parents from using tutor-profile/me", async () => {
    await expect(service.getMyTutorProfile(parent)).rejects.toBeInstanceOf(
      ForbiddenException
    );
  });

  it("creates or updates the current tutor's own profile", async () => {
    prisma.tutorProfile.upsert.mockResolvedValue({
      ...profileRecord,
      displayName: "Updated Tutor"
    });

    const result = await service.upsertMyTutorProfile(tutor, {
      displayName: "Updated Tutor",
      qualifications: "BSc Mathematics",
      experiences: "6 years tutoring"
    });

    expect(prisma.tutorProfile.upsert).toHaveBeenCalledWith({
      where: { userId: "tutor-1" },
      update: {
        displayName: "Updated Tutor",
        qualifications: "BSc Mathematics",
        experiences: "6 years tutoring"
      },
      create: {
        userId: "tutor-1",
        displayName: "Updated Tutor",
        qualifications: "BSc Mathematics",
        experiences: "6 years tutoring"
      }
    });
    expect(result.displayName).toBe("Updated Tutor");
  });

  it("does not allow one tutor to fetch another tutor's own profile through /me", async () => {
    prisma.tutorProfile.findUnique.mockResolvedValue(null);

    await expect(service.getMyTutorProfile(otherTutor)).rejects.toBeInstanceOf(
      NotFoundException
    );
    expect(prisma.tutorProfile.findUnique).toHaveBeenCalledWith({
      where: { userId: "tutor-2" }
    });
  });
});
