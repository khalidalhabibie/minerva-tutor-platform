import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, Min, MinLength } from "class-validator";

export class CreateCaseDto {
  @ApiProperty({ type: String, example: "Math tutor for Grade 8" })
  @IsString()
  @MinLength(1)
  title!: string;

  @ApiProperty({ type: String, example: "Mathematics" })
  @IsString()
  @MinLength(1)
  subject!: string;

  @ApiProperty({ type: String, example: "Grade 8" })
  @IsString()
  @MinLength(1)
  level!: string;

  @ApiProperty({ type: String, example: "Jakarta Selatan" })
  @IsString()
  @MinLength(1)
  location!: string;

  @ApiProperty({ type: Number, example: 250000, minimum: 0 })
  @IsNumber()
  @Min(0)
  budgetPerHour!: number;
}
