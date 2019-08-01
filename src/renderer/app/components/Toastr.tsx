import { IToasterProps, IToastOptions, Toaster } from "@blueprintjs/core";
import { clearToasts } from "@common/store/ui";
import * as React from "react";

interface Props extends IToasterProps {
    toasts: IToastOptions[];
    clearToasts: typeof clearToasts;
}

export default class Toastr extends React.PureComponent<Props> {

    private toaster: Toaster | null = null;

    public componentDidUpdate() {
        const { toasts, clearToasts } = this.props;

        if (toasts.length) {
            toasts.forEach((toast) => {
                if (this.toaster) {
                    this.toaster.show(toast);
                }
            });

            clearToasts();
        }
    }

    public render() {
        const { toasts, clearToasts, ...props } = this.props;

        return <Toaster {...props} ref={(r) => this.toaster = r} />;
    }
}
