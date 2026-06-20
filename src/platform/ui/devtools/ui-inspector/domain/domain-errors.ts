export type DomainErrorCode =
  | 'NOT_FOUND'
  | 'DUPLICATE_NAME'
  | 'INVALID_NAME'
  | 'INVALID_BINDING'
  | 'RELATION_TARGET_MISSING'
  | 'DELETE_HAS_DEPENDENCIES'
  | 'STORAGE_REQUIRES_DATABASE_COLUMN'
  | 'LEGACY_STORAGE_READONLY'
  | 'GOVERNANCE_VIOLATION'
  | 'UNKNOWN';

export type DomainError = {
  code: DomainErrorCode;
  message: string;
  details?: Record<string, string | number | boolean | null | undefined>;
};

export function createDomainError(
  code: DomainErrorCode,
  message: string,
  details?: DomainError['details']
): DomainError {
  return details ? { code, message, details } : { code, message };
}

export function isDomainError(error: unknown): error is DomainError {
  if (!error || typeof error !== 'object') return false;
  const candidate = error as DomainError;
  return typeof candidate.code === 'string' && typeof candidate.message === 'string';
}

export function assertDomain(condition: boolean, error: DomainError): asserts condition {
  if (!condition) throw error;
}

export function mapRefErrorToDomain(error: string | undefined, fallback: DomainErrorCode = 'UNKNOWN'): DomainError {
  if (!error) return createDomainError(fallback, 'Operation failed.');
  const lower = error.toLowerCase();
  if (lower.includes('not found')) return createDomainError('NOT_FOUND', error);
  if (lower.includes('already exists') || lower.includes('duplicate')) {
    return createDomainError('DUPLICATE_NAME', error);
  }
  if (lower.includes('invalid') || lower.includes('empty')) {
    return createDomainError('INVALID_NAME', error);
  }
  return createDomainError(fallback, error);
}
