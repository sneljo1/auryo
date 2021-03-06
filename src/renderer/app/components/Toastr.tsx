import { IToasterProps } from '@blueprintjs/core';
import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import ReduxToastr from 'react-redux-toastr';

export const Toastr: FC<IToasterProps> = (props) => {
  const toastr = useSelector((state) => state.toastr);

  return (
    <ReduxToastr
      timeOut={4000}
      newestOnTop={false}
      preventDuplicates={false}
      position="top-right"
      transitionIn="fadeIn"
      transitionOut="fadeOut"
      toastr={toastr}
      closeOnToastrClick
    />
  );
};
