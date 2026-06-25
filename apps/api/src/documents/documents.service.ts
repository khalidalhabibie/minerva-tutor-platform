import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  PayloadTooLargeException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Document, UserRole } from "@prisma/client";
import { randomUUID } from "crypto";
import * as path from "path";
import { AccessControlService } from "../access-control/access-control.service";
import { AuthTokenPayload } from "../auth/types/auth-token-payload";
import { PrismaService } from "../prisma/prisma.service";
import { DocumentResponseDto } from "./dto/document-response.dto";
import { StorageService } from "./storage/storage.service";
import { UploadedDocumentFile } from "./types/uploaded-document-file";

type DownloadResult = {
  buffer: Buffer;
  document: DocumentResponseDto;
};

const allowedTypes = new Map<string, Set<string>>([
  ["pdf", new Set(["application/pdf"])],
  [
    "docx",
    new Set([
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ])
  ],
  ["png", new Set(["image/png"])],
  ["jpg", new Set(["image/jpeg"])],
  ["jpeg", new Set(["image/jpeg"])]
]);

@Injectable()
export class DocumentsService {
  private readonly maxFileSizeBytes: number;

  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
    @Inject(AccessControlService)
    private readonly accessControl: AccessControlService,
    @Inject(StorageService)
    private readonly storage: StorageService,
    @Inject(ConfigService)
    configService: ConfigService
  ) {
    this.maxFileSizeBytes =
      configService.getOrThrow<number>("MAX_FILE_SIZE_MB") * 1024 * 1024;
  }

  async uploadCaseDocument(
    user: AuthTokenPayload,
    caseId: string,
    file: UploadedDocumentFile | undefined
  ): Promise<DocumentResponseDto> {
    await this.assertCaseExists(caseId);

    if (!(await this.accessControl.canAccessCase(user, caseId))) {
      throw new ForbiddenException("You cannot upload documents to this case");
    }

    const validatedFile = this.validateFile(file);
    const document = await this.saveDocument(validatedFile, user.sub, {
      caseId,
      tutorProfileId: null
    });

    return this.toDocumentResponse(document);
  }

  async listCaseDocuments(
    user: AuthTokenPayload,
    caseId: string
  ): Promise<DocumentResponseDto[]> {
    await this.assertCaseExists(caseId);

    if (!(await this.accessControl.canAccessCase(user, caseId))) {
      throw new ForbiddenException("You cannot view documents for this case");
    }

    const documents = await this.prisma.document.findMany({
      where: { caseId },
      orderBy: { createdAt: "desc" }
    });

    return documents.map((document) => this.toDocumentResponse(document));
  }

  async uploadOwnTutorProfileDocument(
    user: AuthTokenPayload,
    file: UploadedDocumentFile | undefined
  ): Promise<DocumentResponseDto> {
    if (user.role !== UserRole.TUTOR) {
      throw new ForbiddenException("Only tutors can upload profile documents");
    }

    const profile = await this.prisma.tutorProfile.findUnique({
      where: { userId: user.sub },
      select: { id: true }
    });

    if (!profile) {
      throw new NotFoundException("Tutor profile not found");
    }

    const validatedFile = this.validateFile(file);
    const document = await this.saveDocument(validatedFile, user.sub, {
      caseId: null,
      tutorProfileId: profile.id
    });

    return this.toDocumentResponse(document);
  }

  async listTutorProfileDocuments(
    user: AuthTokenPayload,
    profileId: string
  ): Promise<DocumentResponseDto[]> {
    await this.assertTutorProfileExists(profileId);

    if (!(await this.accessControl.canViewTutorProfile(user, profileId))) {
      throw new ForbiddenException("You cannot view documents for this profile");
    }

    const documents = await this.prisma.document.findMany({
      where: { tutorProfileId: profileId },
      orderBy: { createdAt: "desc" }
    });

    return documents.map((document) => this.toDocumentResponse(document));
  }

  async downloadDocument(
    user: AuthTokenPayload,
    documentId: string
  ): Promise<DownloadResult> {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      throw new NotFoundException("Document not found");
    }

    if (!(await this.accessControl.canAccessDocument(user, documentId))) {
      throw new ForbiddenException("You cannot download this document");
    }

    const storedFile = await this.storage.read(document.storageKey);

    return {
      buffer: storedFile.buffer,
      document: this.toDocumentResponse(document)
    };
  }

  private validateFile(file: UploadedDocumentFile | undefined): UploadedDocumentFile {
    if (!file) {
      throw new BadRequestException("A file is required");
    }

    if (file.size > this.maxFileSizeBytes) {
      throw new PayloadTooLargeException(
        `File is too large. Maximum size is ${this.maxFileSizeBytes / 1024 / 1024}MB`
      );
    }

    const extension = this.getExtension(file.originalname);
    const allowedMimeTypes = allowedTypes.get(extension);

    if (!allowedMimeTypes || !allowedMimeTypes.has(file.mimetype)) {
      throw new BadRequestException(
        "Unsupported file type. Allowed types: pdf, docx, png, jpg, jpeg"
      );
    }

    return {
      ...file,
      originalname: this.sanitizeFilename(file.originalname)
    };
  }

  private async saveDocument(
    file: UploadedDocumentFile,
    uploadedById: string,
    owner: { caseId: string | null; tutorProfileId: string | null }
  ): Promise<Document> {
    const storageKey = this.generateStorageKey(file.originalname);
    await this.storage.save(storageKey, file.buffer);

    return this.prisma.document.create({
      data: {
        caseId: owner.caseId,
        tutorProfileId: owner.tutorProfileId,
        uploadedById,
        originalFilename: file.originalname,
        storageKey,
        mimeType: file.mimetype,
        size: file.size
      }
    });
  }

  private async assertCaseExists(caseId: string): Promise<void> {
    const tuitionCase = await this.prisma.tuitionCase.findUnique({
      where: { id: caseId },
      select: { id: true }
    });

    if (!tuitionCase) {
      throw new NotFoundException("Case not found");
    }
  }

  private async assertTutorProfileExists(profileId: string): Promise<void> {
    const profile = await this.prisma.tutorProfile.findUnique({
      where: { id: profileId },
      select: { id: true }
    });

    if (!profile) {
      throw new NotFoundException("Tutor profile not found");
    }
  }

  private sanitizeFilename(filename: string): string {
    const basename = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, "_");
    return basename.length > 0 ? basename : "upload";
  }

  private generateStorageKey(filename: string): string {
    const extension = this.getExtension(filename);
    return `documents/${randomUUID()}.${extension}`;
  }

  private getExtension(filename: string): string {
    return path.extname(filename).slice(1).toLowerCase();
  }

  private toDocumentResponse(document: Document): DocumentResponseDto {
    return {
      id: document.id,
      caseId: document.caseId,
      tutorProfileId: document.tutorProfileId,
      uploadedById: document.uploadedById,
      originalFilename: document.originalFilename,
      mimeType: document.mimeType,
      size: document.size,
      createdAt: document.createdAt
    };
  }
}
