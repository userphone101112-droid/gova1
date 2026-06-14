export abstract class BaseRepository<T> {
  protected abstract resourceName: string;

  protected abstract getById(id: string): Promise<T | null>;
  protected abstract getAll(): Promise<T[]>;
  protected abstract create(data: Omit<T, 'id'>): Promise<T>;
  protected abstract update(id: string, data: Partial<T>): Promise<T>;
  protected abstract delete(id: string): Promise<void>;

  protected abstract mapToEntity(data: unknown): T;
  protected abstract mapToDto(entity: T): unknown;
}
