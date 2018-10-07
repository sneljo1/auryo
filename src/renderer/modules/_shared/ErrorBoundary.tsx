import * as React from 'react';
import { initApp } from '../../../common/store/app';
import AppError from '../app/components/AppError/AppError';

interface Props {
    initApp: typeof initApp;
}

interface State {
    hasError: boolean;
    message?: string;
}

class ErrorBoundary extends React.Component<Props, State> {
    state: State = { hasError: false };

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Display fallback UI
        this.setState({ hasError: true, message: error.message });
        // You can also log the error to an error reporting service
        console.error(errorInfo.componentStack);
        console.error(error);
    }

    render() {
        if (this.state.hasError) {
            return (
                <AppError
                    error={this.state.message || ''}
                    initApp={initApp}
                />
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
