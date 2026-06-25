import {
  ForbiddenException,
  NotFoundException,
  PayloadTooLargeException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { UserRole } from "@prisma/client";
import { AccessControlService } from "../access-control/access-control.service";
import { AuthTokenPayload } from "../auth/types/auth-token-payload";
import { PrismaService } from "../prisma/prisma.service";
import { DocumentsService } from "./documents.service";
import { StorageService } from "./storage/storage.service";
import { UploadedDocumentFile } from "./types/uploaded-document-file";

type PrismaMock = {
  tuitionCase: {
    findUnique: jest.Mock;
  };
  tutorProfile: {
    findUnique: jest.Mock;
  };
  document: {
    create: jest.Mock;
    findMany: jest.Mock;
    findUnique: jest.Mock;
  };
};

type AccessControlMock = {
  canAccessCase: jest.Mock;
  canAccessDocument: jest.Mock;
  canViewTutorProfile: jest.Mock;
};

type StorageMock = {
  save: jest.Mock;
  read: jest.Mock;
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

const documentRecord = {
  id: "doc-1",
  caseId: "case-1",
  tutorProfileId: null,
  uploadedById: "parent-1",
  originalFilename: "student_report.pdf",
  storageKey: "documents/storage-key.pdf",
  mimeType: "application/pdf",
  size: 12,
  createdAt: now
};

function makeFile(overrides: Partial<UploadedDocumentFile> = {}): UploadedDocumentFile {
  return {
    originalname: "student report.pdf",
    mimetype: "application/pdf",
    size: 12,
    buffer: Buffer.from("hello world"),
    ...overrides
  };
}

describe("DocumentsService", () => {
  let prisma: PrismaMock;
  let accessControl: AccessControlMock;
  let storage: StorageMock;
  let service: DocumentsService;

  beforeEach(() => {
    prisma = {
      tuitionCase: {
        findUnique: jest.fn()
      },
      tutorProfile: {
        findUnique: jest.fn()
      },
      document: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn()
      }
    };
    accessControl = {
      canAccessCase: jest.fn(),
      canAccessDocument: jest.fn(),
      canViewTutorProfile: jest.fn()
    };
    storage = {
      save: jest.fn(),
      read: jest.fn()
    };
    const configService = {
      getOrThrow: jest.fn(() => 5)
    };

    service = new DocumentsService(
      prisma as unknown as PrismaService,
      accessControl as unknown as AccessControlService,
      storage as unknown as StorageService,
      configService as unknown as ConfigService
    );
  });

  it("denies unauthorized case document upload", async () => {
    prisma.tuitionCase.findUnique.mockResolvedValue({ id: "case-1" });
    accessControl.canAccessCase.mockResolvedValue(false);

    await expect(
      service.uploadCaseDocument(parent, "case-1", makeFile())
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(storage.save).not.toHaveBeenCalled();
    expect(prisma.document.create).not.toHaveBeenCalled();
  });

  it("rejects unsupported file types with a user-friendly error", async () => {
    prisma.tuitionCase.findUnique.mockResolvedValue({ id: "case-1" });
    accessControl.canAccessCase.mockResolvedValue(true);

    await expect(
      service.uploadCaseDocument(
        parent,
        "case-1",
        makeFile({
          originalname: "script.exe",
          mimetype: "application/octet-stream"
        })
      )
    ).rejects.toMatchObject({
      response: {
        statusCode: 400,
        message: "Unsupported file type. Allowed types: pdf, docx, png, jpg, jpeg"
      }
    });
  });

  it("rejects files over the configured max size", async () => {
    prisma.tuitionCase.findUnique.mockResolvedValue({ id: "case-1" });
    accessControl.canAccessCase.mockResolvedValue(true);

    await expect(
      service.uploadCaseDocument(
        parent,
        "case-1",
        makeFile({
          size: 5 * 1024 * 1024 + 1
        })
      )
    ).rejects.toBeInstanceOf(PayloadTooLargeException);
  });

  it("uploads a valid case document with sanitized filename and hidden storage key", async () => {
    prisma.tuitionCase.findUnique.mockResolvedValue({ id: "case-1" });
    accessControl.canAccessCase.mockResolvedValue(true);
    prisma.document.create.mockResolvedValue(documentRecord);

    const result = await service.uploadCaseDocument(
      parent,
      "case-1",
      makeFile({
        originalname: "../student report.pdf"
      })
    );

    expect(storage.save).toHaveBeenCalledWith(
      expect.stringMatching(/^documents\/[a-f0-9-]+\.pdf$/),
      Buffer.from("hello world")
    );
    expect(prisma.document.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        caseId: "case-1",
        tutorProfileId: null,
        uploadedById: "parent-1",
        originalFilename: "student_report.pdf",
        mimeType: "application/pdf",
        size: 12
      })
    });
    expect(result).toEqual({
      id: "doc-1",
      caseId: "case-1",
      tutorProfileId: null,
      uploadedById: "parent-1",
      originalFilename: "student_report.pdf",
      mimeType: "application/pdf",
      size: 12,
      createdAt: now
    });
    expect(result).not.toHaveProperty("storageKey");
  });

  it("allows only owning tutors to upload tutor profile documents", async () => {
    prisma.tutorProfile.findUnique.mockResolvedValue({ id: "profile-1" });
    prisma.document.create.mockResolvedValue({
      ...documentRecord,
      caseId: null,
      tutorProfileId: "profile-1",
      uploadedById: "tutor-1"
    });

    const result = await service.uploadOwnTutorProfileDocument(
      tutor,
      makeFile({ originalname: "cv.pdf" })
    );

    expect(prisma.tutorProfile.findUnique).toHaveBeenCalledWith({
      where: { userId: "tutor-1" },
      select: { id: true }
    });
    expect(result.tutorProfileId).toBe("profile-1");
  });

  it("denies parents uploading tutor profile documents", async () => {
    await expect(
      service.uploadOwnTutorProfileDocument(parent, makeFile())
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("downloads a file for an authorized user after re-checking access", async () => {
    prisma.document.findUnique.mockResolvedValue(documentRecord);
    accessControl.canAccessDocument.mockResolvedValue(true);
    storage.read.mockResolvedValue({
      buffer: Buffer.from("downloadable"),
      size: 12
    });

    const result = await service.downloadDocument(parent, "doc-1");

    expect(accessControl.canAccessDocument).toHaveBeenCalledWith(parent, "doc-1");
    expect(storage.read).toHaveBeenCalledWith("documents/storage-key.pdf");
    expect(result.buffer.toString()).toBe("downloadable");
    expect(result.document).not.toHaveProperty("storageKey");
  });

  it("denies unauthorized document downloads and does not read storage", async () => {
    prisma.document.findUnique.mockResolvedValue(documentRecord);
    accessControl.canAccessDocument.mockResolvedValue(false);

    await expect(service.downloadDocument(tutor, "doc-1")).rejects.toBeInstanceOf(
      ForbiddenException
    );

    expect(storage.read).not.toHaveBeenCalled();
  });

  it("returns 404 for missing documents", async () => {
    prisma.document.findUnique.mockResolvedValue(null);

    await expect(service.downloadDocument(parent, "doc-1")).rejects.toBeInstanceOf(
      NotFoundException
    );
  });

  it("lists tutor profile documents only when the profile is visible", async () => {
    prisma.tutorProfile.findUnique.mockResolvedValue({ id: "profile-1" });
    accessControl.canViewTutorProfile.mockResolvedValue(true);
    prisma.document.findMany.mockResolvedValue([
      {
        ...documentRecord,
        caseId: null,
        tutorProfileId: "profile-1"
      }
    ]);

    const result = await service.listTutorProfileDocuments(parent, "profile-1");

    expect(result).toHaveLength(1);
    expect(prisma.document.findMany).toHaveBeenCalledWith({
      where: { tutorProfileId: "profile-1" },
      orderBy: { createdAt: "desc" }
    });
  });
});
