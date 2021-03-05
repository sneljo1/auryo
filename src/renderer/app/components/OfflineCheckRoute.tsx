import { offlineSelector } from '@common/store/app/selectors';
import { Offline } from '@renderer/app/components/Offline/Offline';
import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { Route, RouteProps } from 'react-router-dom';

export const OfflineCheckRoute: FC<RouteProps> = ({ component: Component, render, ...rest }) => {
  const isOffline = useSelector(offlineSelector);

  return (
    <Route
      {...rest}
      render={(props) => {
        if (!isOffline) {
          if (Component) {
            return <Component {...props} />;
          }

          if (render) {
            return render(props);
          }
        }

        return <Offline />;
      }}
    />
  );
};
