import { Module } from "@nestjs/common";
import { AccessControlModule } from "../access-control/access-control.module";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { TutorProfilesController } from "./tutor-profiles.controller";
import { TutorProfilesService } from "./tutor-profiles.service";

@Module({
  imports: [AccessControlModule, AuthModule, PrismaModule],
  controllers: [TutorProfilesController],
  providers: [TutorProfilesService],
  exports: [TutorProfilesService]
})
export class TutorProfilesModule {}
