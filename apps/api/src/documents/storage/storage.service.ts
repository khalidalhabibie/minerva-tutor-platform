export type StoredFile = {
  buffer: Buffer;
  size: number;
};

export abstract class StorageService {
  abstract save(storageKey: string, buffer: Buffer): Promise<void>;
  abstract read(storageKey: string): Promise<StoredFile>;
}
