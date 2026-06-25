import { Module } from "@nestjs/common";
import { AccessControlModule } from "../access-control/access-control.module";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { DocumentsController } from "./documents.controller";
import { DocumentsService } from "./documents.service";
import { LocalStorageService } from "./storage/local-storage.service";
import { StorageService } from "./storage/storage.service";

@Module({
  imports: [AccessControlModule, AuthModule, PrismaModule],
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    {
      provide: StorageService,
      useClass: LocalStorageService
    }
  ],
  exports: [DocumentsService, StorageService]
})
export class DocumentsModule {}
