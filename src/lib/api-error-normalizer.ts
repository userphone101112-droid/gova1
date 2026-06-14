import { AxiosError } from 'axios';

import { ApiError } from '@/types/errors';

import { errorHandler } from './error-handler';

export function normalizeApiError(error: unknown, endpoint?: string): ApiError {
  if (error instanceof AxiosError) {
    const statusCode = error.response?.status;
    const responseData = error.response?.data;

    return new ApiError(
      errorHandler['getErrorCodeFromStatus'](statusCode),
      responseData?.message || error.message || 'API request failed',
      statusCode,
      endpoint,
      {
        url: error.config?.url,
        method: error.config?.method,
        response: responseData,
      }
    );
  }

  return errorHandler.handleApiError(error, endpoint);
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return !error.response && !!error.request;
  }
  return false;
}

export function isTimeoutError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return error.code === 'ECONNABORTED' || error.message.includes('timeout');
  }
  return false;
}
