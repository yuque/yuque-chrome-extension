import React from 'react';
import { message } from 'antd';
import { __i18n } from '@/isomorphic/i18n';
import FallbackUI from './FallbackUI';

interface IErrorBoundaryProps {
  withFallbackUI?: boolean;
  fallbackUI?: React.FC<any>;
  noMessage?: boolean;
  children: React.ReactNode;
  errorMessage?: string;
}

class ErrorBoundary extends React.Component<IErrorBoundaryProps> {
  state = {
    error: null,
    info: null,
  };

  componentDidCatch(error: any, info: any) {
    message.error(__i18n('页面出错了'));
    this.setState({
      error,
      info,
    });
    error.componentStack = info ? info.componentStack : '';
    error.from = 'ErrorBoundary';
  }

  render() {
    const { error, info } = this.state;
    const { withFallbackUI, fallbackUI, children, errorMessage } = this.props;
    if (error) {
      if (withFallbackUI) {
        const ErrorFallbackComponent = fallbackUI || FallbackUI;
        return (
          <ErrorFallbackComponent
            error={error}
            info={info}
            errorMessage={errorMessage}
          />
        );
      }
      return null;
    }

    return children;
  }
}

export const withErrorBoundary = <T extends object>(
  Component: React.FC<T>,
  withFallbackUI?: boolean,
  fallbackUI?: React.FC<any>,
  errorMessage?: string,
) => {
  return (props: T) => {
    return (
      <ErrorBoundary
        withFallbackUI={withFallbackUI}
        fallbackUI={fallbackUI}
        errorMessage={errorMessage}
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

export default ErrorBoundary;
