import {
  Controller,
  Get,
  Header,
  Inject,
  Param,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiPayloadTooLargeResponse,
  ApiTags,
  ApiUnauthorizedResponse
} from "@nestjs/swagger";
import { Response } from "express";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AuthTokenPayload } from "../auth/types/auth-token-payload";
import { DocumentResponseDto } from "./dto/document-response.dto";
import { DocumentsService } from "./documents.service";
import { UploadedDocumentFile } from "./types/uploaded-document-file";

const multipartFileSchema = {
  schema: {
    type: "object",
    properties: {
      file: {
        type: "string",
        format: "binary"
      }
    },
    required: ["file"]
  }
};

@ApiTags("documents")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class DocumentsController {
  constructor(
    @Inject(DocumentsService)
    private readonly documentsService: DocumentsService
  ) {}

  @Post("cases/:id/documents")
  @UseInterceptors(FileInterceptor("file"))
  @ApiOperation({ summary: "Upload a document to an accessible case" })
  @ApiConsumes("multipart/form-data")
  @ApiBody(multipartFileSchema)
  @ApiCreatedResponse({ type: DocumentResponseDto })
  @ApiBadRequestResponse({ description: "Missing file or unsupported file type" })
  @ApiPayloadTooLargeResponse({ description: "Uploaded file exceeds max size" })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({ description: "User cannot upload to this case" })
  @ApiNotFoundResponse({ description: "Case not found" })
  uploadCaseDocument(
    @CurrentUser() user: AuthTokenPayload,
    @Param("id") id: string,
    @UploadedFile() file: UploadedDocumentFile
  ): Promise<DocumentResponseDto> {
    return this.documentsService.uploadCaseDocument(user, id, file);
  }

  @Get("cases/:id/documents")
  @ApiOperation({ summary: "List documents for an accessible case" })
  @ApiOkResponse({ type: [DocumentResponseDto] })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({ description: "User cannot view documents for this case" })
  @ApiNotFoundResponse({ description: "Case not found" })
  listCaseDocuments(
    @CurrentUser() user: AuthTokenPayload,
    @Param("id") id: string
  ): Promise<DocumentResponseDto[]> {
    return this.documentsService.listCaseDocuments(user, id);
  }

  @Post("tutor-profile/documents")
  @UseInterceptors(FileInterceptor("file"))
  @ApiOperation({ summary: "Upload a document to the current tutor profile" })
  @ApiConsumes("multipart/form-data")
  @ApiBody(multipartFileSchema)
  @ApiCreatedResponse({ type: DocumentResponseDto })
  @ApiBadRequestResponse({ description: "Missing file or unsupported file type" })
  @ApiPayloadTooLargeResponse({ description: "Uploaded file exceeds max size" })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({ description: "Only the owning tutor can upload" })
  @ApiNotFoundResponse({ description: "Tutor profile not found" })
  uploadTutorProfileDocument(
    @CurrentUser() user: AuthTokenPayload,
    @UploadedFile() file: UploadedDocumentFile
  ): Promise<DocumentResponseDto> {
    return this.documentsService.uploadOwnTutorProfileDocument(user, file);
  }

  @Get("tutor-profiles/:id/documents")
  @ApiOperation({ summary: "List documents for a visible tutor profile" })
  @ApiOkResponse({ type: [DocumentResponseDto] })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({ description: "User cannot view documents for this profile" })
  @ApiNotFoundResponse({ description: "Tutor profile not found" })
  listTutorProfileDocuments(
    @CurrentUser() user: AuthTokenPayload,
    @Param("id") id: string
  ): Promise<DocumentResponseDto[]> {
    return this.documentsService.listTutorProfileDocuments(user, id);
  }

  @Get("documents/:id/download")
  @Header("Content-Type", "application/octet-stream")
  @ApiOperation({ summary: "Download an authorized document" })
  @ApiOkResponse({ description: "Document file stream" })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({ description: "User cannot download this document" })
  @ApiNotFoundResponse({ description: "Document or stored file not found" })
  async downloadDocument(
    @CurrentUser() user: AuthTokenPayload,
    @Param("id") id: string,
    @Res({ passthrough: true }) response: Response
  ): Promise<StreamableFile> {
    const download = await this.documentsService.downloadDocument(user, id);
    response.setHeader("Content-Type", download.document.mimeType);
    response.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(download.document.originalFilename)}"`
    );
    return new StreamableFile(download.buffer);
  }
}
