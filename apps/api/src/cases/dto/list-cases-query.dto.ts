import { ApiPropertyOptional } from "@nestjs/swagger";
import { TuitionCaseStatus } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class ListCasesQueryDto {
  @ApiPropertyOptional({ type: Number, example: 1, default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    type: Number,
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @ApiPropertyOptional({ type: String, example: "math" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ type: String, example: "Mathematics" })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ type: String, example: "Grade 8" })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({ enum: TuitionCaseStatus })
  @IsOptional()
  @IsEnum(TuitionCaseStatus)
  status?: TuitionCaseStatus;
}
