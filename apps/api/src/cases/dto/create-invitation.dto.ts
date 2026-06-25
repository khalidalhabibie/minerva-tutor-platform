import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class CreateInvitationDto {
  @ApiProperty({ type: String, example: "tutor-user-id" })
  @IsString()
  @MinLength(1)
  tutorId!: string;
}
