import React, { FC } from 'react';
import './Offline.scss';

export const Offline: FC = () => {
  return (
    <div className="offline flex flex-column">
      <i className="bx bx-wifi-off" />
      <div className="offline-content">
        <h2>You seem to be offline</h2>
        <p>Reconnect and we'll get you back into the app</p>
      </div>
    </div>
  );
};
