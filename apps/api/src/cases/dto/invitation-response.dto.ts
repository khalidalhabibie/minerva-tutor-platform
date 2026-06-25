import { ApiProperty } from "@nestjs/swagger";

export class InvitationResponseDto {
  @ApiProperty({ type: String })
  id!: string;

  @ApiProperty({ type: String })
  caseId!: string;

  @ApiProperty({ type: String })
  tutorId!: string;

  @ApiProperty({ type: String, format: "date-time" })
  createdAt!: Date;

  @ApiProperty({ type: String, format: "date-time", nullable: true })
  revokedAt!: Date | null;
}
