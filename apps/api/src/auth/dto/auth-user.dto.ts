import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";

export class AuthUserDto {
  @ApiProperty({ type: String })
  id!: string;

  @ApiProperty({ type: String, example: "parent@example.com" })
  email!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.PARENT })
  role!: UserRole;

  @ApiProperty({ type: String, format: "date-time" })
  createdAt!: Date;

  @ApiProperty({ type: String, format: "date-time" })
  updatedAt!: Date;
}
