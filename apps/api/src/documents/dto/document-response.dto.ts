import { ApiProperty } from "@nestjs/swagger";

export class DocumentResponseDto {
  @ApiProperty({ type: String })
  id!: string;

  @ApiProperty({ type: String, nullable: true })
  caseId!: string | null;

  @ApiProperty({ type: String, nullable: true })
  tutorProfileId!: string | null;

  @ApiProperty({ type: String })
  uploadedById!: string;

  @ApiProperty({ type: String, example: "student-report.pdf" })
  originalFilename!: string;

  @ApiProperty({ type: String, example: "application/pdf" })
  mimeType!: string;

  @ApiProperty({ type: Number, example: 128000 })
  size!: number;

  @ApiProperty({ type: String, format: "date-time" })
  createdAt!: Date;
}
