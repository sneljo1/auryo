import { IToasterProps, IToastOptions, Toaster } from '@blueprintjs/core';
import * as actions from '@common/store/actions';
import React from 'react';

interface Props extends IToasterProps {
  toasts: IToastOptions[];
  clearToasts: typeof actions.clearToasts;
}

export class Toastr extends React.PureComponent<Props> {
  private toaster = React.createRef<Toaster>();

  public componentDidUpdate() {
    const { toasts, clearToasts } = this.props;

    if (toasts.length) {
      toasts.forEach(toast => {
        if (this.toaster.current) {
          this.toaster.current.show(toast);
        }
      });

      clearToasts();
    }
  }

  public render() {
    const { toasts, clearToasts, ...props } = this.props;

    return <Toaster {...props} ref={this.toaster} />;
  }
}
