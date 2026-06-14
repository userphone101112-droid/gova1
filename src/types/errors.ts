export enum ErrorCode {
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  
  // API errors
  API_ERROR = 'API_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  
  // Client errors
  BAD_REQUEST = 'BAD_REQUEST',
  
  // Server errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  
  // Application errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AppError {
  code: ErrorCode;
  message: string;
  details?: unknown;
  stack?: string;
  timestamp: Date;
}

export class BaseError extends Error implements AppError {
  code: ErrorCode;
  details?: unknown;
  timestamp: Date;

  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    this.timestamp = new Date();
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NetworkError extends BaseError {
  constructor(message: string = 'Network error occurred', details?: unknown) {
    super(ErrorCode.NETWORK_ERROR, message, details);
  }
}

export class ApiError extends BaseError {
  statusCode: number | undefined;
  endpoint: string | undefined;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number | undefined,
    endpoint: string | undefined,
    details?: unknown
  ) {
    super(code, message, details);
    this.statusCode = statusCode;
    this.endpoint = endpoint;
  }
}

export class ValidationError extends BaseError {
  constructor(message: string, details?: unknown) {
    super(ErrorCode.VALIDATION_ERROR, message, details);
  }
}
