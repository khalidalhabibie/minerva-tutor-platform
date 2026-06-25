import { UserRole } from "@prisma/client";
import { AuthTokenPayload } from "../auth/types/auth-token-payload";
import { PrismaService } from "../prisma/prisma.service";
import { AccessControlService } from "./access-control.service";

type PrismaMock = {
  tuitionCase: {
    findFirst: jest.Mock;
  };
  caseInvitation: {
    findFirst: jest.Mock;
  };
  document: {
    findUnique: jest.Mock;
  };
  tutorProfile: {
    findUnique: jest.Mock;
    findFirst: jest.Mock;
  };
};

const parent: AuthTokenPayload = {
  sub: "parent-1",
  role: UserRole.PARENT
};

const otherParent: AuthTokenPayload = {
  sub: "parent-2",
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

describe("AccessControlService", () => {
  let prisma: PrismaMock;
  let service: AccessControlService;

  beforeEach(() => {
    prisma = {
      tuitionCase: {
        findFirst: jest.fn()
      },
      caseInvitation: {
        findFirst: jest.fn()
      },
      document: {
        findUnique: jest.fn()
      },
      tutorProfile: {
        findUnique: jest.fn(),
        findFirst: jest.fn()
      }
    };

    service = new AccessControlService(prisma as unknown as PrismaService);
  });

  describe("canAccessCase", () => {
    it("allows a parent to access their own case", async () => {
      prisma.tuitionCase.findFirst.mockResolvedValue({ id: "case-1" });

      await expect(service.canAccessCase(parent, "case-1")).resolves.toBe(true);
      expect(prisma.tuitionCase.findFirst).toHaveBeenCalledWith({
        where: {
          id: "case-1",
          ownerId: "parent-1"
        },
        select: { id: true }
      });
    });

    it("denies a parent access to another parent's case", async () => {
      prisma.tuitionCase.findFirst.mockResolvedValue(null);

      await expect(service.canAccessCase(otherParent, "case-1")).resolves.toBe(
        false
      );
    });

    it("allows a tutor with an active invitation", async () => {
      prisma.caseInvitation.findFirst.mockResolvedValue({ id: "invite-1" });

      await expect(service.canAccessCase(tutor, "case-1")).resolves.toBe(true);
      expect(prisma.caseInvitation.findFirst).toHaveBeenCalledWith({
        where: {
          caseId: "case-1",
          tutorId: "tutor-1",
          revokedAt: null
        },
        select: { id: true }
      });
    });

    it("denies a tutor without an active invitation", async () => {
      prisma.caseInvitation.findFirst.mockResolvedValue(null);

      await expect(service.canAccessCase(otherTutor, "case-1")).resolves.toBe(
        false
      );
    });
  });

  describe("canEditCase", () => {
    it("allows only the parent owner to edit a case", async () => {
      prisma.tuitionCase.findFirst.mockResolvedValue({ id: "case-1" });

      await expect(service.canEditCase(parent, "case-1")).resolves.toBe(true);
    });

    it("denies a non-owner parent", async () => {
      prisma.tuitionCase.findFirst.mockResolvedValue(null);

      await expect(service.canEditCase(otherParent, "case-1")).resolves.toBe(
        false
      );
    });

    it("denies tutors even when they can access the case", async () => {
      await expect(service.canEditCase(tutor, "case-1")).resolves.toBe(false);
      expect(prisma.tuitionCase.findFirst).not.toHaveBeenCalled();
    });
  });

  describe("canManageCaseInvitations", () => {
    it("allows the parent owner to invite or revoke tutors", async () => {
      prisma.tuitionCase.findFirst.mockResolvedValue({ id: "case-1" });

      await expect(
        service.canManageCaseInvitations(parent, "case-1")
      ).resolves.toBe(true);
    });

    it("denies tutors from managing case invitations", async () => {
      await expect(
        service.canManageCaseInvitations(tutor, "case-1")
      ).resolves.toBe(false);
    });
  });

  describe("canAccessDocument", () => {
    it("allows case document access when the user can access the case", async () => {
      prisma.document.findUnique.mockResolvedValue({
        caseId: "case-1",
        tutorProfileId: null
      });
      prisma.tuitionCase.findFirst.mockResolvedValue({ id: "case-1" });

      await expect(service.canAccessDocument(parent, "doc-1")).resolves.toBe(
        true
      );
    });

    it("denies case document access when the user cannot access the case", async () => {
      prisma.document.findUnique.mockResolvedValue({
        caseId: "case-1",
        tutorProfileId: null
      });
      prisma.caseInvitation.findFirst.mockResolvedValue(null);

      await expect(service.canAccessDocument(tutor, "doc-1")).resolves.toBe(
        false
      );
    });

    it("re-checks document access on every call", async () => {
      prisma.document.findUnique.mockResolvedValue({
        caseId: "case-1",
        tutorProfileId: null
      });
      prisma.caseInvitation.findFirst
        .mockResolvedValueOnce({ id: "invite-1" })
        .mockResolvedValueOnce(null);

      await expect(service.canAccessDocument(tutor, "doc-1")).resolves.toBe(
        true
      );
      await expect(service.canAccessDocument(tutor, "doc-1")).resolves.toBe(
        false
      );
      expect(prisma.document.findUnique).toHaveBeenCalledTimes(2);
      expect(prisma.caseInvitation.findFirst).toHaveBeenCalledTimes(2);
    });

    it("allows tutor profile document access through tutor profile visibility", async () => {
      prisma.document.findUnique.mockResolvedValue({
        caseId: null,
        tutorProfileId: "profile-1"
      });
      prisma.tutorProfile.findUnique.mockResolvedValue({ id: "profile-1" });

      await expect(service.canAccessDocument(parent, "doc-1")).resolves.toBe(
        true
      );
    });

    it("denies missing documents", async () => {
      prisma.document.findUnique.mockResolvedValue(null);

      await expect(service.canAccessDocument(parent, "doc-1")).resolves.toBe(
        false
      );
    });
  });

  describe("canEditOwnTutorProfile", () => {
    it("allows a tutor to edit their own profile", () => {
      expect(service.canEditOwnTutorProfile(tutor, "tutor-1")).toBe(true);
    });

    it("denies a tutor editing another tutor profile", () => {
      expect(service.canEditOwnTutorProfile(tutor, "tutor-2")).toBe(false);
    });

    it("denies parents from editing tutor profiles", () => {
      expect(service.canEditOwnTutorProfile(parent, "tutor-1")).toBe(false);
    });
  });

  describe("canViewTutorProfile", () => {
    it("allows parents to view tutor profiles", async () => {
      prisma.tutorProfile.findUnique.mockResolvedValue({ id: "profile-1" });

      await expect(service.canViewTutorProfile(parent, "profile-1")).resolves.toBe(
        true
      );
    });

    it("allows tutors to view only their own profile", async () => {
      prisma.tutorProfile.findFirst.mockResolvedValue({ id: "profile-1" });

      await expect(service.canViewTutorProfile(tutor, "profile-1")).resolves.toBe(
        true
      );
      expect(prisma.tutorProfile.findFirst).toHaveBeenCalledWith({
        where: {
          id: "profile-1",
          userId: "tutor-1"
        },
        select: { id: true }
      });
    });

    it("denies tutors from viewing other tutor profiles", async () => {
      prisma.tutorProfile.findFirst.mockResolvedValue(null);

      await expect(
        service.canViewTutorProfile(otherTutor, "profile-1")
      ).resolves.toBe(false);
    });
  });
});
