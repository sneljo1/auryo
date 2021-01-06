import { IToasterProps, Toaster } from '@blueprintjs/core';
import * as actions from '@common/store/actions';
import { getToastsSelector } from '@common/store/selectors';
import React, { FC, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export const Toastr: FC<IToasterProps> = props => {
  const toasterRef = useRef<Toaster>(null);
  const toasts = useSelector(getToastsSelector);
  const dispatch = useDispatch();

  useEffect(() => {
    if (toasts.length) {
      toasts.forEach(toast => {
        if (toasterRef.current) {
          toasterRef.current.show(toast);
        }
      });

      dispatch(actions.clearToasts());
    }
  }, [dispatch, toasts]);

  return <Toaster {...props} ref={toasterRef} />;
};
