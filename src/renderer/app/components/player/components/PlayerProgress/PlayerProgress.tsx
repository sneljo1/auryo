import { Slider } from '@blueprintjs/core';
import { EVENTS } from '@common/constants';
import * as actions from '@common/store/actions';
import { getPlayerCurrentTime, getPlayerDuration } from '@common/store/selectors';
import { getReadableTime } from '@common/utils';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './PlayerProgress.module.scss';

export const PlayerProgress: FC = () => {
  const dispatch = useDispatch();
  const currentTime = useSelector(getPlayerCurrentTime);
  const duration = useSelector(getPlayerDuration);

  const [isSeeking, setIsSeeking] = useState(false);
  const [nextTime, setNextTime] = useState<number>();

  const sliderValue = isSeeking ? nextTime : currentTime;

  const seekToValue = useCallback(
    (to: number) => {
      setIsSeeking(false);
      dispatch(actions.seekTo(to));
      ipcRenderer.send(EVENTS.PLAYER.SEEK_END, to);
    },
    [dispatch]
  );

  const seekChange = useCallback((to: number) => {
    setNextTime(to);
    setIsSeeking(true);
  }, []);

  // Progress seeking
  useEffect(() => {
    let stopSeeking: any;

    ipcRenderer.on(EVENTS.PLAYER.SEEK, (_event, to: number) => {
      if (!isSeeking) {
        setIsSeeking(true);
      }

      clearTimeout(stopSeeking);

      seekChange(to);

      stopSeeking = setTimeout(() => {
        seekToValue(to);
      }, 100);
    });

    return () => {
      ipcRenderer.removeAllListeners(EVENTS.PLAYER.SEEK);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.playerTimeline}>
      <div className={styles.time}>{getReadableTime(isSeeking && nextTime ? nextTime : currentTime)}</div>
      <div className={styles.progressInner}>
        <Slider
          min={0}
          max={duration}
          value={sliderValue}
          stepSize={1}
          onChange={seekChange}
          labelRenderer={false}
          onRelease={seekToValue}
        />
      </div>
      <div className={styles.time}>{getReadableTime(duration)}</div>
    </div>
  );
};
