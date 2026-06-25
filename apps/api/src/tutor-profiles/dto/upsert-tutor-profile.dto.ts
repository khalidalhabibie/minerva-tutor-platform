import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class UpsertTutorProfileDto {
  @ApiProperty({ type: String, example: "Aisha Rahman" })
  @IsString()
  @MinLength(1)
  displayName!: string;

  @ApiProperty({ type: String, example: "BSc Mathematics" })
  @IsString()
  @MinLength(1)
  qualifications!: string;

  @ApiProperty({ type: String, example: "5 years tutoring secondary students" })
  @IsString()
  @MinLength(1)
  experiences!: string;
}
