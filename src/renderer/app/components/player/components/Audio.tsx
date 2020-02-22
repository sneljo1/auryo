/* eslint-disable react-hooks/exhaustive-deps */
import { Intent } from '@blueprintjs/core';
import { EVENTS } from '@common/constants';
import * as actions from '@common/store/actions';
import { ChangeTypes, PlayerStatus } from '@common/store/player';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';
import { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAudioPlayer, useAudioPosition } from '@renderer/hooks/useAudioPlayer';
import { usePrevious } from '@renderer/hooks/usePrevious';

interface Props {
  src?: string;
  muted?: boolean;
  playerStatus: PlayerStatus;
  playerVolume?: number;
  playbackDeviceId: string | null;
}

export const Audio: FC<Props> = ({ src, playerStatus, playerVolume, muted, playbackDeviceId }) => {
  const [isSeeking, setIsSeeking] = useState(false);
  const { duration, position } = useAudioPosition();
  const dispatch = useDispatch();

  const {
    play,
    pause,
    ready,
    loading,
    playing,
    load,
    seek,
    ended,
    stop,
    volume,
    mute,
    error,
    setSinkId
  } = useAudioPlayer();
  const wasPrevLoading = usePrevious(loading);

  useEffect(() => {
    if (playerStatus === PlayerStatus.PLAYING && !playing && !loading) {
      play();
    } else if (playerStatus === PlayerStatus.PAUSED && playing) {
      pause();
    } else if (playerStatus === PlayerStatus.STOPPED && playing) {
      stop();
    }
  }, [playerStatus, loading, ready, playing]);

  // SetAudioPlaybackDevice
  useEffect(() => {
    const setPlaybackDevice = async () => {
      if (!playbackDeviceId) {
        return;
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = devices.filter(device => device.kind === 'audiooutput');

      const selectedAudioDevice = audioDevices.find(d => d.deviceId === playbackDeviceId);

      if (selectedAudioDevice) {
        await setSinkId(playbackDeviceId);
      }
    };

    setPlaybackDevice();
  }, [playbackDeviceId, setSinkId]);

  // handle src change
  useEffect(() => {
    if (src) {
      load({
        src,
        volume: playerVolume
      });
    }
  }, [src]);

  // Handle volume change
  useEffect(() => {
    if (typeof playerVolume !== 'undefined') {
      volume(playerVolume);
    }
  }, [playerVolume]);

  // Handle mute
  useEffect(() => {
    if (typeof muted !== 'undefined') {
      mute(muted);
    }
  }, [muted]);

  // Handle seeking
  useEffect(() => {
    let stopSeeking: any;

    ipcRenderer.on(EVENTS.PLAYER.SEEK, (_event, to: number) => {
      if (!isSeeking) {
        setIsSeeking(true);
      }

      clearTimeout(stopSeeking);

      // this.seekChange(to);

      stopSeeking = setTimeout(() => {
        setIsSeeking(false);

        seek(to);

        // setCurrentTime(to);
        ipcRenderer.send(EVENTS.PLAYER.SEEK_END, to);
      }, 100);
    });

    return () => {
      ipcRenderer.removeAllListeners(EVENTS.PLAYER.SEEK);

      // Stop if we unload this component
      if (playing) {
        stop();
      }
    };
  }, []);

  // Onload
  useEffect(() => {
    if (wasPrevLoading && !loading && !error) {
      dispatch(actions.setDuration(duration));
      dispatch(actions.registerPlay());
    }
  }, [loading]);

  // OnPlay
  useEffect(() => {
    if (typeof position === 'number') {
      dispatch(actions.setCurrentTime(position));
    }
  }, [position, ready]);

  // OnEnd
  useEffect(() => {
    if (ended) {
      dispatch(actions.changeTrack(ChangeTypes.NEXT, true));
    }
  }, [ended]);

  const retry = () => {
    if (error && src) {
      load({
        src,
        volume: playerVolume
      });
    }
  };

  // OnError
  useEffect(() => {
    if (error) {
      // eslint-disable-next-line no-console
      console.error(error);

      switch (error.code) {
        case MediaError.MEDIA_ERR_NETWORK:
          retry();
          setTimeout(retry, 500);
          break;
        case MediaError.MEDIA_ERR_DECODE:
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
        default:
          dispatch(
            actions.addToast({
              message: 'An error occurred during playback',
              intent: Intent.DANGER
            })
          );
      }
    }
  }, [error]);

  return null;
};
