import { EVENTS } from '@common/constants/events';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';
import React from 'react';
import AppError from '../app/components/AppError/AppError';

interface State {
  hasError: boolean;
  message?: string;
}

class ErrorBoundary extends React.PureComponent<{}, State> {
  public state: State = { hasError: false };

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Display fallback UI
    this.setState({ hasError: true, message: error.message });
    // You can also log the error to an error reporting service
    // eslint-disable-next-line no-console
    console.error(errorInfo.componentStack);
    // eslint-disable-next-line no-console
    console.error(error);
  }

  private reload() {
    ipcRenderer.send(EVENTS.APP.RELOAD);
  }

  public render() {
    const { hasError, message } = this.state;
    const { children } = this.props;

    if (hasError) {
      const error = message || '';

      return <AppError error={error} reload={this.reload} />;
    }

    return children;
  }
}

export default ErrorBoundary;
