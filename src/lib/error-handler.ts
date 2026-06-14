import { AppError, BaseError, ErrorCode, ApiError } from '@/types/errors';

export class ErrorHandler {
  private static instance: ErrorHandler;

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  public handleError(error: unknown, context?: string): AppError {
    console.error(`[Error Handler] ${context || 'Unknown context'}:`, error);

    if (error instanceof BaseError) {
      return error;
    }

    if (error instanceof Error) {
      return new BaseError(
        ErrorCode.UNKNOWN_ERROR,
        error.message,
        { originalError: error.name, stack: error.stack }
      );
    }

    if (typeof error === 'string') {
      return new BaseError(ErrorCode.UNKNOWN_ERROR, error);
    }

    return new BaseError(
      ErrorCode.UNKNOWN_ERROR,
      'An unknown error occurred',
      { error }
    );
  }

  public handleApiError(
    error: unknown,
    endpoint?: string,
    statusCode?: number
  ): ApiError {
    const appError = this.handleError(error, `API call to ${endpoint}`);

    if (appError instanceof ApiError) {
      return appError;
    }

    return new ApiError(
      this.getErrorCodeFromStatus(statusCode),
      appError.message,
      statusCode,
      endpoint,
      appError.details
    );
  }

  private getErrorCodeFromStatus(status?: number): ErrorCode {
    if (!status) return ErrorCode.API_ERROR;

    switch (status) {
      case 400:
        return ErrorCode.BAD_REQUEST;
      case 401:
        return ErrorCode.UNAUTHORIZED;
      case 403:
        return ErrorCode.FORBIDDEN;
      case 404:
        return ErrorCode.NOT_FOUND;
      case 409:
        return ErrorCode.CONFLICT;
      case 422:
        return ErrorCode.VALIDATION_ERROR;
      case 500:
        return ErrorCode.INTERNAL_SERVER_ERROR;
      case 503:
        return ErrorCode.SERVICE_UNAVAILABLE;
      default:
        return ErrorCode.API_ERROR;
    }
  }

  public logError(error: AppError, context?: string): void {
    const logMessage = `[${error.code}] ${context || 'Error'}: ${error.message}`;
    
    if (process.env.NODE_ENV === 'development') {
      console.error(logMessage, error.details, error.stack);
    } else {
      console.error(logMessage);
    }
  }
}

export const errorHandler = ErrorHandler.getInstance();
