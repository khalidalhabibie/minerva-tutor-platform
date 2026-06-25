import { PartialType } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { TuitionCaseStatus } from "@prisma/client";
import { CreateCaseDto } from "./create-case.dto";

export class UpdateCaseDto extends PartialType(CreateCaseDto) {
  @IsOptional()
  @IsEnum(TuitionCaseStatus)
  status?: TuitionCaseStatus;
}
