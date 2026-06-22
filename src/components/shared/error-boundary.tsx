'use client';

import React, { Component, ReactNode } from 'react';

import { errorHandler } from '@/lib/error-handler';
import { useTranslation, ERROR_BOUNDARY } from '@/platform/ui';
import { AppError } from '@/types/errors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: AppError) => void;
}

interface State {
  hasError: boolean;
  error: AppError | null;
}

function ErrorFallback({
  error,
  onReload,
}: {
  error: AppError | null;
  onReload: () => void;
}) {
  const { t } = useTranslation();

  return (
    <main className="flex min-h-error items-center justify-center p-4">
      <div className="max-w-md text-center">
        <h2 data-ui-uuid={ERROR_BOUNDARY.TITLE.uuid} className="mb-4 text-2xl font-bold text-on-surface">
          {t(ERROR_BOUNDARY.TITLE)}
        </h2>
        <div className="mb-6 text-on-surface-variant">
          {error?.message || t(ERROR_BOUNDARY.DEFAULT_MESSAGE)}
        </div>
        <button data-ui-uuid={ERROR_BOUNDARY.RELOAD_BUTTON.uuid} onClick={onReload}>
          {t(ERROR_BOUNDARY.RELOAD_BUTTON)}
        </button>
      </div>
    </main>
  );
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
        <ErrorFallback
          error={this.state.error}
          onReload={() => window.location.reload()}
        />
      );
    }

    return this.props.children;
  }
}
