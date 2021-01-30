/* eslint-disable react-hooks/exhaustive-deps */
import { Intent } from '@blueprintjs/core';
import { EVENTS } from '@common/constants';
import * as actions from '@common/store/actions';
import { ChangeTypes, PlayerStatus } from '@common/store/player';
import { useAudioPlayer, useAudioPosition } from '@renderer/hooks/useAudioPlayer';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';
import { FC, memo, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePrevious } from 'react-use';
import { getPlayerCurrentTime } from '@common/store/selectors';

interface Props {
  src?: string;
  muted?: boolean;
  playerStatus: PlayerStatus;
  playerVolume?: number;
  playbackDeviceId: string | null;
}

// TODO: use webAudio?
// https://github.com/DPr00f/electron-music-player-tutorial/blob/master/app/utils/AudioController.js

export const Audio: FC<Props> = memo(({ src, playerStatus, playerVolume, muted, playbackDeviceId }) => {
  const [isSeeking, setIsSeeking] = useState(false);
  const { duration, position } = useAudioPosition();
  const currentTime = useSelector(getPlayerCurrentTime);
  const previousSrc = usePrevious(src);
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
      const audioDevices = devices.filter((device) => device.kind === 'audiooutput');

      const selectedAudioDevice = audioDevices.find((d) => d.deviceId === playbackDeviceId);

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
      // TODO: remove
      // dispatch(actions.setDuration(duration));
      // TODO: can we move this to our observables?
      // dispatch(actions.registerPlayO());
    }
  }, [loading]);

  // handle track restart
  useEffect(() => {
    if (currentTime === 0 && position > 0 && src && src === previousSrc) {
      load({
        src,
        volume: playerVolume
      });
    }
  }, [currentTime]);

  // OnPlay
  useEffect(() => {
    if (typeof position === 'number' && playerStatus === PlayerStatus.PLAYING) {
      dispatch(actions.setCurrentTime(position));
    }
  }, [position, ready]);

  // OnEnd
  useEffect(() => {
    if (ended) {
      dispatch(actions.trackFinished());
    }
  }, [ended]);

  const retry = useCallback(() => {
    if (error && src) {
      load({
        src,
        volume: playerVolume
      });
    }
  }, [load, src, error, playerVolume]);

  // OnError
  useEffect(() => {
    if (error) {
      // eslint-disable-next-line no-console
      console.error('Audio.tsx', error);

      switch (error.code) {
        case MediaError.MEDIA_ERR_NETWORK:
          retry();
          setTimeout(retry, 500);
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          dispatch(
            actions.addToast({
              message:
                'We are unable to play this track. It may be that this song is not available via third party applications.',
              intent: Intent.DANGER
            })
          );

          // dispatch(actions.changeTrack(ChangeTypes.NEXT));
          break;
        case MediaError.MEDIA_ERR_DECODE:
        default:
          dispatch(
            actions.addToast({
              message: 'Something went wrong while playing this track',
              intent: Intent.DANGER
            })
          );

        // dispatch(actions.changeTrack(ChangeTypes.NEXT));
      }
    }
  }, [error]);

  return null;
});
