import { Popover } from '@blueprintjs/core';
import { castSelector } from '@common/store/app/selectors';
import cn from 'classnames';
import React, { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from '../Player.module.scss';
import * as actions from '@common/store/actions';

export const CastPopover: FC = () => {
  const dispatch = useDispatch();
  const chromecast = useSelector(castSelector);

  if (!chromecast.devices.length) return null;

  return (
    <Popover
      className="mr-2"
      popoverClassName={styles.playerPopover}
      content={
        <div style={{ minWidth: 200 }}>
          <div className={styles.popoverTitle}>Nearby devices</div>
          {chromecast.devices.map((d) => {
            return (
              <div
                role="button"
                key={d.id}
                className={styles.castDevice}
                onClick={() => {
                  dispatch(actions.setChromecastDevice(chromecast.selectedDeviceId === d.id ? undefined : d.id));
                }}>
                {chromecast.selectedDeviceId === d.id && <i className="bx bx-stop" />}
                <div>
                  {d.name}
                  <div className={styles.castSub}>
                    {chromecast.selectedDeviceId === d.id && !chromecast.castApp && 'Connecting...'}
                    {chromecast.selectedDeviceId === d.id && chromecast.castApp ? 'Casting' : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      }>
      <a
        className={cn(styles.control, {
          [styles.active]: !!chromecast.castApp
        })}
        href="javascript:void(0)">
        <i className="bx bx-cast" />
      </a>
    </Popover>
  );
};
