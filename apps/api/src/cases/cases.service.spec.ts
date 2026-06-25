import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { TuitionCaseStatus, UserRole } from "@prisma/client";
import { AccessControlService } from "../access-control/access-control.service";
import { AuthTokenPayload } from "../auth/types/auth-token-payload";
import { PrismaService } from "../prisma/prisma.service";
import { CasesService } from "./cases.service";

type PrismaMock = {
  $transaction: jest.Mock;
  tuitionCase: {
    create: jest.Mock;
    count: jest.Mock;
    findMany: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
  };
  caseInvitation: {
    upsert: jest.Mock;
    findMany: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
  };
  user: {
    findFirst: jest.Mock;
  };
};

type AccessControlMock = {
  canAccessCase: jest.Mock;
  canEditCase: jest.Mock;
  canManageCaseInvitations: jest.Mock;
};

const parent: AuthTokenPayload = {
  sub: "parent-1",
  role: UserRole.PARENT
};

const tutor: AuthTokenPayload = {
  sub: "tutor-1",
  role: UserRole.TUTOR
};

const now = new Date("2026-06-25T00:00:00.000Z");

const caseRecord = {
  id: "case-1",
  ownerId: "parent-1",
  title: "Math tutor",
  subject: "Mathematics",
  level: "Grade 8",
  location: "Jakarta",
  budgetPerHour: "250000",
  status: TuitionCaseStatus.OPEN,
  createdAt: now,
  updatedAt: now
};

const invitationRecord = {
  id: "invite-1",
  caseId: "case-1",
  tutorId: "tutor-1",
  createdAt: now,
  revokedAt: null
};

describe("CasesService", () => {
  let prisma: PrismaMock;
  let accessControl: AccessControlMock;
  let service: CasesService;

  beforeEach(() => {
    prisma = {
      $transaction: jest.fn(async (queries: unknown[]) => Promise.all(queries)),
      tuitionCase: {
        create: jest.fn(),
        count: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn()
      },
      caseInvitation: {
        upsert: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn()
      },
      user: {
        findFirst: jest.fn()
      }
    };
    accessControl = {
      canAccessCase: jest.fn(),
      canEditCase: jest.fn(),
      canManageCaseInvitations: jest.fn()
    };
    service = new CasesService(
      prisma as unknown as PrismaService,
      accessControl as unknown as AccessControlService
    );
  });

  it("allows parents to create cases and scopes ownerId to the current user", async () => {
    prisma.tuitionCase.create.mockResolvedValue(caseRecord);

    const result = await service.createCase(parent, {
      title: "Math tutor",
      subject: "Mathematics",
      level: "Grade 8",
      location: "Jakarta",
      budgetPerHour: 250000
    });

    expect(prisma.tuitionCase.create).toHaveBeenCalledWith({
      data: {
        ownerId: "parent-1",
        title: "Math tutor",
        subject: "Mathematics",
        level: "Grade 8",
        location: "Jakarta",
        budgetPerHour: 250000,
        status: TuitionCaseStatus.OPEN
      }
    });
    expect(result).toMatchObject({
      id: "case-1",
      budgetPerHour: 250000
    });
  });

  it("denies tutors creating cases", async () => {
    await expect(
      service.createCase(tutor, {
        title: "Math tutor",
        subject: "Mathematics",
        level: "Grade 8",
        location: "Jakarta",
        budgetPerHour: 250000
      })
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("lists only a parent's own cases with filters and pagination", async () => {
    prisma.tuitionCase.count.mockResolvedValue(1);
    prisma.tuitionCase.findMany.mockResolvedValue([caseRecord]);

    const result = await service.listCases(parent, {
      page: 2,
      pageSize: 10,
      search: "math",
      subject: "Mathematics",
      level: "Grade 8",
      status: TuitionCaseStatus.OPEN
    });

    expect(prisma.tuitionCase.count).toHaveBeenCalledWith({
      where: {
        ownerId: "parent-1",
        title: {
          contains: "math",
          mode: "insensitive"
        },
        subject: "Mathematics",
        level: "Grade 8",
        status: TuitionCaseStatus.OPEN
      }
    });
    expect(prisma.tuitionCase.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10
      })
    );
    expect(result.pagination).toEqual({
      page: 2,
      pageSize: 10,
      total: 1,
      totalPages: 1
    });
  });

  it("lists only active invited cases for tutors", async () => {
    prisma.tuitionCase.count.mockResolvedValue(1);
    prisma.tuitionCase.findMany.mockResolvedValue([caseRecord]);

    await service.listCases(tutor, {
      page: 1,
      pageSize: 20
    });

    expect(prisma.tuitionCase.count).toHaveBeenCalledWith({
      where: {
        invitations: {
          some: {
            tutorId: "tutor-1",
            revokedAt: null
          }
        }
      }
    });
  });

  it("returns empty data and pagination metadata for out-of-range pages", async () => {
    prisma.tuitionCase.count.mockResolvedValue(2);
    prisma.tuitionCase.findMany.mockResolvedValue([]);

    const result = await service.listCases(parent, {
      page: 99,
      pageSize: 10
    });

    expect(result).toEqual({
      data: [],
      pagination: {
        page: 99,
        pageSize: 10,
        total: 2,
        totalPages: 1
      }
    });
  });

  it("allows an invited tutor to view a case", async () => {
    prisma.tuitionCase.findUnique.mockResolvedValue(caseRecord);
    accessControl.canAccessCase.mockResolvedValue(true);

    const result = await service.getCase(tutor, "case-1");

    expect(accessControl.canAccessCase).toHaveBeenCalledWith(tutor, "case-1");
    expect(result.id).toBe("case-1");
  });

  it("denies a non-invited tutor from viewing a case", async () => {
    prisma.tuitionCase.findUnique.mockResolvedValue(caseRecord);
    accessControl.canAccessCase.mockResolvedValue(false);

    await expect(service.getCase(tutor, "case-1")).rejects.toBeInstanceOf(
      ForbiddenException
    );
  });

  it("returns 404 when a case does not exist", async () => {
    prisma.tuitionCase.findUnique.mockResolvedValue(null);

    await expect(service.getCase(parent, "missing-case")).rejects.toBeInstanceOf(
      NotFoundException
    );
  });

  it("allows the parent owner to update a case", async () => {
    prisma.tuitionCase.findUnique.mockResolvedValue(caseRecord);
    accessControl.canEditCase.mockResolvedValue(true);
    prisma.tuitionCase.update.mockResolvedValue({
      ...caseRecord,
      title: "Updated title"
    });

    const result = await service.updateCase(parent, "case-1", {
      title: "Updated title"
    });

    expect(prisma.tuitionCase.update).toHaveBeenCalledWith({
      where: { id: "case-1" },
      data: {
        title: "Updated title"
      }
    });
    expect(result.title).toBe("Updated title");
  });

  it("creates an invitation only when target user is a tutor", async () => {
    prisma.tuitionCase.findUnique.mockResolvedValue(caseRecord);
    accessControl.canManageCaseInvitations.mockResolvedValue(true);
    prisma.user.findFirst.mockResolvedValue({ id: "tutor-1" });
    prisma.caseInvitation.upsert.mockResolvedValue(invitationRecord);

    const result = await service.createInvitation(parent, "case-1", {
      tutorId: "tutor-1"
    });

    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: {
        id: "tutor-1",
        role: UserRole.TUTOR
      },
      select: { id: true }
    });
    expect(result).toMatchObject({
      caseId: "case-1",
      tutorId: "tutor-1"
    });
  });

  it("soft revokes an invitation by setting revokedAt", async () => {
    const revokedAt = new Date("2026-06-25T01:00:00.000Z");
    jest.spyOn(global, "Date").mockImplementation(() => revokedAt);
    prisma.tuitionCase.findUnique.mockResolvedValue(caseRecord);
    accessControl.canManageCaseInvitations.mockResolvedValue(true);
    prisma.caseInvitation.findUnique.mockResolvedValue(invitationRecord);
    prisma.caseInvitation.update.mockResolvedValue({
      ...invitationRecord,
      revokedAt
    });

    const result = await service.revokeInvitation(parent, "case-1", "tutor-1");

    expect(prisma.caseInvitation.update).toHaveBeenCalledWith({
      where: {
        caseId_tutorId: {
          caseId: "case-1",
          tutorId: "tutor-1"
        }
      },
      data: {
        revokedAt
      }
    });
    expect(result.revokedAt).toBe(revokedAt);

    jest.restoreAllMocks();
  });
});
