import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AccessControlModule } from "./access-control/access-control.module";
import { AuthModule } from "./auth/auth.module";
import { validateEnvironment } from "./config/env.validation";
import { HealthModule } from "./health/health.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ["../../.env", ".env"],
      validate: validateEnvironment
    }),
    AccessControlModule,
    AuthModule,
    HealthModule,
    PrismaModule
  ]
})
export class AppModule {}
