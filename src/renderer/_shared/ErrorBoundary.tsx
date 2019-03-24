import { ipcRenderer } from 'electron';
import * as React from 'react';
import AppError from '../app/components/AppError/AppError';
import { EVENTS } from '@common/constants/events';

interface Props {
}

interface State {
    hasError: boolean;
    message?: string;
}

class ErrorBoundary extends React.PureComponent<Props, State> {
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
                    reload={this.reload}
                />
            );
        }
        return this.props.children;
    }

    private reload(){
        ipcRenderer.send(EVENTS.APP.RELOAD);
    }
}

export default ErrorBoundary;
