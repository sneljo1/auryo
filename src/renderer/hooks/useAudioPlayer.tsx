import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';

interface AudioSrcProps {
  src: string;
  format?: string;
  autoplay?: boolean;
  volume?: number;
}

interface AudioPlayer {
  audioEl: HTMLAudioElement;
  load: (args: AudioSrcProps) => void;
  error: MediaError | null;
  loading: boolean;
  playing: boolean;
  stopped: boolean;
  ended: boolean;
  ready: boolean;
}

type UseAudioPlayer = Omit<AudioPlayer, 'audioEl'> & {
  toggle(): void;
  play(): Promise<void>;
  setSinkId(deviceId: string): Promise<void>;
  pause(): void;
  stop(): void;
  mute(muted: boolean): void;
  seek(to: number): void;
  volume(volume: number): void;
};

const AudioPlayerContext = React.createContext<AudioPlayer>({} as any);

interface AudioPlayerProviderProps {
  children: React.ReactNode;
  value?: AudioPlayer;
}

interface AudioPosition {
  position: number;
  duration: number;
}

export const isPlaying = (autoEl: HTMLAudioElement) => {
  return !!(autoEl.currentTime > 0 && !autoEl.paused && !autoEl.ended && autoEl.readyState > 2);
};

export function AudioPlayerProvider({ children, value }: AudioPlayerProviderProps) {
  const audioEl = useRef(document.createElement('audio'));
  // const [audioContext] = useState(() => new AudioContext());

  const [error, setError] = useState<MediaError | null>(null);
  const [loading, setLoading] = useState(true);
  const [ended, setEnded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [stopped, setStopped] = useState(true);

  useEffect(() => {
    // const sourceNode = audioContext.createMediaElementSource(audioEl.current);
    // const gainNode = audioContext.createGain();
    // sourceNode.connect(gainNode);
    // gainNode.connect(audioContext.destination);
  }, []);

  useEffect(() => {
    if (stopped) {
      setStopped(true);
      setPlaying(false);
    }
  }, [stopped]);

  useEffect(() => {
    const onMetadataLoaded = () => {
      setError(null);
      setStopped(true);
      setLoading(false);
      setEnded(false);
    };

    const onCanPlay = () => {
      setLoading(false);
      setEnded(false);
    };

    const onError = () => {
      setError(audioEl.current.error);
      setPlaying(false);
      setStopped(true);
    };

    const onPlay = () => {
      setPlaying(true);
      setStopped(false);
    };

    const onPause = () => {
      setPlaying(false);
    };

    const onEnded = () => {
      setEnded(true);
      setPlaying(false);
    };

    const ref = audioEl.current;

    ref.addEventListener('loadedmetadata', onMetadataLoaded);
    ref.addEventListener('canplay', onCanPlay);
    ref.addEventListener('error', onError);
    ref.addEventListener('play', onPlay);

    ref.addEventListener('pause', onPause);
    ref.addEventListener('ended', onEnded);

    return () => {
      ref.removeEventListener('loadedmetadata', onMetadataLoaded);
      ref.removeEventListener('canplay', onCanPlay);
      ref.removeEventListener('error', onError);
      ref.removeEventListener('play', onPlay);
      ref.removeEventListener('pause', onPause);
      ref.removeEventListener('ended', onEnded);
    };
  }, []);

  const load = useCallback(({ src, volume, autoplay = false }: AudioSrcProps) => {
    setLoading(true);
    setEnded(false);
    const wasPlaying = isPlaying(audioEl.current);

    audioEl.current.src = src;

    if (volume) audioEl.current.volume = volume;
    if (wasPlaying || autoplay) audioEl.current.autoplay = wasPlaying || autoplay;
  }, []);

  const contextValue: AudioPlayer = value || {
    audioEl: audioEl.current,
    load,
    error,
    loading,
    playing,
    stopped,
    ready: !loading && !error,
    ended
  };

  return <AudioPlayerContext.Provider value={contextValue}>{children}</AudioPlayerContext.Provider>;
}

export const useAudioPlayer = (): UseAudioPlayer => {
  const { audioEl, load, ...context } = useContext(AudioPlayerContext);

  return {
    ...context,
    setSinkId(deviceId: string) {
      return (audioEl as any).setSinkId(deviceId);
    },
    toggle() {
      try {
        if (audioEl.paused) {
          audioEl.play();
        } else {
          audioEl.pause();
        }
      } catch (_) {
        // Do not handle load interupted play errors
      }
    },
    async play() {
      try {
        await audioEl.play();
      } catch (_) {
        // Do not handle load interupted play errors
      }
    },
    pause() {
      audioEl.pause();
    },
    stop() {
      audioEl.currentTime = 0;
      audioEl.pause();
      audioEl.src = '';
    },
    mute(muted: boolean) {
      audioEl.muted = muted;
    },
    seek(to: number) {
      audioEl.currentTime = to;
    },
    volume(volume: number) {
      audioEl.volume = volume;
    },
    load
  };
};

// gives current audio position state - updates in an animation frame loop for animating audio visualizations
export const useAudioPosition = (): AudioPosition => {
  const { audioEl, playing, stopped, loading } = useContext(AudioPlayerContext);
  const { duration } = audioEl;

  const [position, setPosition] = useState(0);

  // sets position and duration on player initialization and when the audio is stopped
  useEffect(() => {
    setPosition(audioEl.currentTime || 0);
  }, [audioEl, stopped, loading]);

  let timeout: number;
  // updates position on a one second loop
  useEffect(() => {
    setPosition(audioEl.currentTime || 0);
    if (playing) timeout = window.setInterval(() => setPosition(audioEl.currentTime || 0), 1000);

    return () => clearTimeout(timeout);
  }, [playing]);

  return { position, duration: Number.isNaN(duration) ? 0 : duration };
};
