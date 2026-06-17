'use client';

import React, { Component, ReactNode } from 'react';

import { errorHandler } from '@/lib/error-handler';
import { AppError } from '@/types/errors';
import { UiButton, UiDiv, UiHeader, UiMain } from '@/components/ui';
import { ERROR_BOUNDARY } from '@/shared/ui-registry';
import { DECORATIVE } from '@/shared/ui-registry/categories';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: AppError) => void;
}

interface State {
  hasError: boolean;
  error: AppError | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    const appError = errorHandler.handleError(error);
    return {
      hasError: true,
      error: appError,
    };
  }

  componentDidCatch(error: Error, _errorInfo: React.ErrorInfo): void {
    const appError = errorHandler.handleError(error, 'ErrorBoundary');
    errorHandler.logError(appError, 'ErrorBoundary componentDidCatch');
    
    this.props.onError?.(appError);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <UiMain className="flex min-h-[400px] items-center justify-center p-4">
          <UiDiv ui={DECORATIVE.SPACER} className="max-w-md text-center">
            <UiHeader
              ui={DECORATIVE.SPACER}
              level={2}
              className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100"
            >
              Something went wrong
            </UiHeader>
            <UiDiv ui={DECORATIVE.SPACER} className="mb-6 text-gray-600 dark:text-gray-400">
              {this.state.error?.message || 'An unexpected error occurred'}
            </UiDiv>
            <UiButton
              ui={ERROR_BOUNDARY.RELOAD_BUTTON}
              onClick={() => window.location.reload()}
            >
              Reload Page
            </UiButton>
          </UiDiv>
        </UiMain>
      );
    }

    return this.props.children;
  }
}
