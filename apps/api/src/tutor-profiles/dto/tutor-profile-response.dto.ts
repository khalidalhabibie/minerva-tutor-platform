import { ApiProperty } from "@nestjs/swagger";

export class TutorProfileResponseDto {
  @ApiProperty({ type: String })
  id!: string;

  @ApiProperty({ type: String })
  userId!: string;

  @ApiProperty({ type: String, example: "Aisha Rahman" })
  displayName!: string;

  @ApiProperty({ type: String, example: "BSc Mathematics" })
  qualifications!: string;

  @ApiProperty({ type: String, example: "5 years tutoring secondary students" })
  experiences!: string;

  @ApiProperty({ type: String, format: "date-time" })
  createdAt!: Date;

  @ApiProperty({ type: String, format: "date-time" })
  updatedAt!: Date;
}
