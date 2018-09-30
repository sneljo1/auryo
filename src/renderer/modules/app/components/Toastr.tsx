import { IToastOptions, Toaster, IToasterProps } from '@blueprintjs/core';
import React from 'react';
import { clearToasts } from '../../../../shared/store/ui';

interface Props extends IToasterProps {
    toasts: Array<IToastOptions>;
    clearToasts: typeof clearToasts;
}

export default class Toastr extends React.PureComponent<Props> {

    private toaster: Toaster | null;

    componentDidUpdate() {
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

    render() {
        const { toasts, clearToasts, ...props } = this.props;

        return <Toaster {...props} ref={(r) => this.toaster = r} />;
    }
}
