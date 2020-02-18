import React, { useState, useEffect, FC } from 'react';
import * as styles from './PlayerProgress.module.scss';
import { getReadableTime } from '@common/utils';
import { Slider } from '@blueprintjs/core';
import { useDispatch } from 'react-redux';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';
import { EVENTS } from '@common/constants';
import { useAudioPlayer, useAudioPosition } from '../../../../../hooks/useAudioPlayer';
import * as actions from '@common/store/actions';

export const PlayerProgress: FC = () => {
  const dispatch = useDispatch();
  const { seek } = useAudioPlayer();
  const { duration, position: currentTime } = useAudioPosition();

  const [isSeeking, setIsSeeking] = useState();
  const [nextTime, setNextTime] = useState();

  const sliderValue = isSeeking ? nextTime : currentTime;

  const seekToValue = (to: number) => {
    setIsSeeking(false);
    seek(to);
    dispatch(actions.setCurrentTime(to));
    ipcRenderer.send(EVENTS.PLAYER.SEEK_END, to);
  };

  const seekChange = (to: number) => {
    setNextTime(to);
    setIsSeeking(true);
  };

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
      <div className={styles.time}>{getReadableTime(isSeeking ? nextTime : currentTime, false, true)}</div>
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
      <div className={styles.time}>{getReadableTime(duration, false, true)}</div>
    </div>
  );
};
