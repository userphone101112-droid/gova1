'use client';

import React, { Component, ReactNode } from 'react';

import { errorHandler } from '@/lib/error-handler';
import { AppError } from '@/types/errors';
import { UiButton, UiDiv, UiHeader, UiMain, useTranslation } from '@/platform/ui';
import { ERROR_BOUNDARY } from '@/platform/ui';
import { COMMON_LAYOUT } from '@/platform/ui/registry/categories';

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
    <UiMain ui={COMMON_LAYOUT.MAIN} className="flex min-h-error items-center justify-center p-4">
      <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="max-w-md text-center">
        <UiHeader
          ui={ERROR_BOUNDARY.TITLE}
          level={2}
          className="mb-4 text-2xl font-bold text-on-surface"
        >
          {t(ERROR_BOUNDARY.TITLE)}
        </UiHeader>
        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="mb-6 text-on-surface-variant">
          {error?.message || t(ERROR_BOUNDARY.DEFAULT_MESSAGE)}
        </UiDiv>
        <UiButton ui={ERROR_BOUNDARY.RELOAD_BUTTON} onClick={onReload}>
          {t(ERROR_BOUNDARY.RELOAD_BUTTON)}
        </UiButton>
      </UiDiv>
    </UiMain>
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
