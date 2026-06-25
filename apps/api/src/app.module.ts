import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AccessControlModule } from "./access-control/access-control.module";
import { AuthModule } from "./auth/auth.module";
import { CasesModule } from "./cases/cases.module";
import { validateEnvironment } from "./config/env.validation";
import { DocumentsModule } from "./documents/documents.module";
import { HealthModule } from "./health/health.module";
import { PrismaModule } from "./prisma/prisma.module";
import { TutorProfilesModule } from "./tutor-profiles/tutor-profiles.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ["../../.env", ".env"],
      validate: validateEnvironment
    }),
    AccessControlModule,
    AuthModule,
    CasesModule,
    DocumentsModule,
    HealthModule,
    PrismaModule,
    TutorProfilesModule
  ]
})
export class AppModule {}
