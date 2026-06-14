export abstract class BaseService<T> {
  protected abstract repository: unknown;

  protected abstract getById(id: string): Promise<T | null>;
  protected abstract getAll(): Promise<T[]>;
  protected abstract create(data: Omit<T, 'id'>): Promise<T>;
  protected abstract update(id: string, data: Partial<T>): Promise<T>;
  protected abstract delete(id: string): Promise<void>;

  protected validateData(_data: unknown): boolean {
    return true;
  }

  protected transformData(data: unknown): T {
    return data as T;
  }
}
