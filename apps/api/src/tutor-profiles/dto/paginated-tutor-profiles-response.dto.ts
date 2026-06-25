import { ApiProperty } from "@nestjs/swagger";
import { TutorProfileResponseDto } from "./tutor-profile-response.dto";

class PaginationMetaDto {
  @ApiProperty({ type: Number, example: 1 })
  page!: number;

  @ApiProperty({ type: Number, example: 20 })
  pageSize!: number;

  @ApiProperty({ type: Number, example: 42 })
  total!: number;

  @ApiProperty({ type: Number, example: 3 })
  totalPages!: number;
}

export class PaginatedTutorProfilesResponseDto {
  @ApiProperty({ type: [TutorProfileResponseDto] })
  data!: TutorProfileResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  pagination!: PaginationMetaDto;
}
