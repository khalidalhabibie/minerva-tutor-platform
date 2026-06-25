import { ApiProperty } from "@nestjs/swagger";
import { TuitionCaseStatus } from "@prisma/client";

export class CaseResponseDto {
  @ApiProperty({ type: String })
  id!: string;

  @ApiProperty({ type: String })
  ownerId!: string;

  @ApiProperty({ type: String, example: "Math tutor for Grade 8" })
  title!: string;

  @ApiProperty({ type: String, example: "Mathematics" })
  subject!: string;

  @ApiProperty({ type: String, example: "Grade 8" })
  level!: string;

  @ApiProperty({ type: String, example: "Jakarta Selatan" })
  location!: string;

  @ApiProperty({ type: Number, example: 250000 })
  budgetPerHour!: number;

  @ApiProperty({ enum: TuitionCaseStatus, example: TuitionCaseStatus.OPEN })
  status!: TuitionCaseStatus;

  @ApiProperty({ type: String, format: "date-time" })
  createdAt!: Date;

  @ApiProperty({ type: String, format: "date-time" })
  updatedAt!: Date;
}
