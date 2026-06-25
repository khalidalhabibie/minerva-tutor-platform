import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { constants } from "fs";
import { access, mkdir, readFile, stat, writeFile } from "fs/promises";
import * as path from "path";
import { StorageService, StoredFile } from "./storage.service";

@Injectable()
export class LocalStorageService extends StorageService {
  private readonly uploadDir: string;

  constructor(@Inject(ConfigService) configService: ConfigService) {
    super();
    this.uploadDir = path.resolve(configService.getOrThrow<string>("UPLOAD_DIR"));
  }

  async save(storageKey: string, buffer: Buffer): Promise<void> {
    const filePath = this.resolveSafePath(storageKey);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, buffer, { flag: "wx" });
  }

  async read(storageKey: string): Promise<StoredFile> {
    const filePath = this.resolveSafePath(storageKey);

    try {
      await access(filePath, constants.R_OK);
      const [buffer, fileStat] = await Promise.all([readFile(filePath), stat(filePath)]);
      return {
        buffer,
        size: fileStat.size
      };
    } catch {
      throw new NotFoundException("Stored file not found");
    }
  }

  private resolveSafePath(storageKey: string): string {
    const filePath = path.resolve(this.uploadDir, storageKey);
    const relative = path.relative(this.uploadDir, filePath);

    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      throw new NotFoundException("Stored file not found");
    }

    return filePath;
  }
}
