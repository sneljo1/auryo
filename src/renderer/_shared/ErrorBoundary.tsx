import { EVENTS } from "@common/constants/events";
import { ipcRenderer } from "electron";
import * as React from "react";
import AppError from "../app/components/AppError/AppError";

interface Props {
}

interface State {
    hasError: boolean;
    message?: string;
}

class ErrorBoundary extends React.PureComponent<Props, State> {
    public state: State = { hasError: false };

    public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Display fallback UI
        this.setState({ hasError: true, message: error.message });
        // You can also log the error to an error reporting service
        // tslint:disable-next-line: no-console
        console.error(errorInfo.componentStack);
        // tslint:disable-next-line: no-console
        console.error(error);
    }

    public render() {
        if (this.state.hasError) {
            const error = this.state.message || "";

            return (
                <AppError
                    error={error}
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
