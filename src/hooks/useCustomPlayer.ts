import canAutoplay from 'can-autoplay';
import type Hls from 'hls.js';
import type { ErrorData } from 'hls.js';
import { useRef, useEffect, useState, useCallback } from 'react';
import type { VOD, PlayerSource, PlayerState, PlayerSettings } from '@/types';
import { sleep } from '@/utils/helpers';
import { loadPlayerSettings, savePlayerSettings } from '@/utils/playerSettings';

interface HlsConfig {
  enableWorker: boolean;
  lowLatencyMode: boolean;
  backBufferLength: number;
  maxBufferLength: number;
  maxMaxBufferLength: number;
  maxBufferSize: number;
  maxBufferHole: number;
  liveSyncDurationCount: number;
  liveDurationInfinity: boolean;
  debug: boolean;
}

const hlsConfig: HlsConfig = {
  enableWorker: true,
  lowLatencyMode: false,
  backBufferLength: 90,
  maxBufferLength: 30,
  maxMaxBufferLength: 600,
  maxBufferSize: 60 * 1000 * 1000,
  maxBufferHole: 0.5,
  liveSyncDurationCount: 3,
  liveDurationInfinity: false,
  debug: false,
};

interface UseCustomPlayerOptions {
  type?: string;
  vod: VOD;
  cdnBase?: string;
  playerRef: React.RefObject<HTMLVideoElement | null>;
  setCurrentTime: (_time: number) => void;
  setDelay?: (_delay: number) => void;
  setPlayerState: (_state: PlayerState) => void;
  defaultVolume: number;
  defaultMuted: boolean;
  onUpdateSettings?: (_settings: PlayerSettings) => void;
}

export interface UseCustomPlayerReturn {
  source: PlayerSource;
  setSource: React.Dispatch<React.SetStateAction<PlayerSource>>;
  fileError: string | undefined;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  isFullscreen: boolean;
  playbackSpeed: number;
  isTouchDevice: boolean;
  playIconSize: number;
  toggleFullscreen: () => void;
  togglePlayPause: () => void;
  toggleMute: () => void;
  handleVolumeChange: (_event: Event, newValue: number | number[]) => void;
  handleSeekChange: (_event: Event, newValue: number | number[]) => void;
  handlePlaybackSpeedChange: (speed: number) => void;
  handleError: (_e: React.SyntheticEvent<HTMLVideoElement>) => void;
  toggleTheatreMode: () => void;
  timeUpdate: () => void;
  handlePlay: () => void;
  handlePause: () => void;
  handleEnded: () => void;
  handleWaiting: () => void;
  handlePlaying: () => void;
  handleLoadedMetadata: () => void;
}

export function useCustomPlayer({
  type,
  vod,
  cdnBase,
  playerRef,
  setCurrentTime,
  setDelay,
  setPlayerState,
  defaultVolume,
  defaultMuted,
  onUpdateSettings,
}: UseCustomPlayerOptions): UseCustomPlayerReturn {
  const hlsInstance = useRef<Hls | null>(null);
  const [source, setSource] = useState<PlayerSource>(undefined);
  const [fileError, setFileError] = useState<string | undefined>(undefined);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(defaultVolume || 100);
  const [isMuted, setIsMuted] = useState(defaultMuted || false);
  const [currentTime, setCurrentTimeState] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [playIconSize, setPlayIconSize] = useState(96);

  useEffect(() => {
    setIsTouchDevice(window.matchMedia('(pointer: coarse)').matches);
    const updatePlayIconSize = () => {
      if (window.innerWidth <= 480) {
        setPlayIconSize(48);
      } else if (window.innerWidth <= 768) {
        setPlayIconSize(64);
      } else {
        setPlayIconSize(96);
      }
    };
    updatePlayIconSize();
    window.addEventListener('resize', updatePlayIconSize);
    return () => window.removeEventListener('resize', updatePlayIconSize);
  }, []);

  useEffect(() => {
    const settings = loadPlayerSettings();
    if (settings) {
      setVolume(settings.volume ?? 100);
      setIsMuted(settings.muted ?? false);
      if (playerRef.current) {
        playerRef.current.volume = (settings.volume ?? 100) / 100;
        playerRef.current.muted = settings.muted ?? false;
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initHls = async () => {
      if (type === 'cdn') {
        if (!cdnBase) {
          setFileError('CDN URL not configured');
          return;
        }
        const hlsUrl = `${cdnBase}/videos/${vod.platform_vod_id}/hls/${vod.platform_vod_id}.m3u8`;
        setSource(hlsUrl);

        if (playerRef.current!.canPlayType('application/vnd.apple.mpegurl')) {
          playerRef.current!.src = hlsUrl;
          return;
        }

        const HlsClass = (await import('hls.js')).default;

        if (!isMounted) return;

        if (HlsClass.isSupported()) {
          hlsInstance.current = new HlsClass(hlsConfig);
          hlsInstance.current.loadSource(hlsUrl);
          hlsInstance.current.attachMedia(playerRef.current!);

          hlsInstance.current.on(HlsClass.Events.ERROR, (_event: unknown, _data: unknown) => {
            const data = _data as ErrorData;
            if (data.fatal) {
              switch (data.type) {
                case HlsClass.ErrorTypes.NETWORK_ERROR:
                case HlsClass.ErrorTypes.MEDIA_ERROR:
                  hlsInstance.current!.destroy();
                  break;
                default:
                  hlsInstance.current!.destroy();
                  setFileError('Failed to load video');
                  break;
              }
            }
          });
        }
      }
    };

    initHls();

    return () => {
      isMounted = false;
      if (hlsInstance.current) {
        hlsInstance.current.destroy();
      }
    };
  }, [type, cdnBase, vod, playerRef]);

  const timeUpdate = useCallback(() => {
    if (!playerRef.current) return;
    const currentTime = playerRef.current.currentTime ?? 0;
    setCurrentTimeState(currentTime);
    setCurrentTime(currentTime);
  }, [playerRef, setCurrentTime]);

  const toggleFullscreen = useCallback(() => {
    if (!playerRef.current) return;

    if (!document.fullscreenElement && !document.webkitIsFullScreen) {
      const el = (playerRef.current.parentElement as HTMLElement) || document.fullscreenElement;
      const target = el || playerRef.current.parentElement;
      if (target && target.requestFullscreen) {
        target.requestFullscreen();
      } else if (target && 'webkitRequestFullscreen' in target) {
        (target as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen?.();
      }

      if (isTouchDevice) {
        window.screen.orientation.lock('landscape').catch((e) => console.error(e));
      }

      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
      setIsFullscreen(false);
    }
  }, [playerRef, isTouchDevice]);

  const togglePlayPause = useCallback(() => {
    if (!playerRef.current) return;
    if (playerRef.current.paused) {
      playerRef.current.play();
    } else {
      playerRef.current.pause();
    }
  }, [playerRef]);

  const toggleMute = useCallback(() => {
    if (!playerRef.current) return;
    playerRef.current.muted = !playerRef.current.muted;
    setIsMuted(playerRef.current.muted);
  }, [playerRef]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLElement &&
        (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)
      ) {
        return;
      }

      switch (e.code) {
        case 'Space':
        case 'KeyK':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'KeyM':
          toggleMute();
          break;
        case 'KeyF':
          toggleFullscreen();
          break;
        case 'ArrowRight':
          if (playerRef.current) playerRef.current.currentTime += 5;
          break;
        case 'ArrowLeft':
          if (playerRef.current) playerRef.current.currentTime -= 5;
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (playerRef.current) {
            playerRef.current.volume = Math.min(1, playerRef.current.volume + 0.1);
            playerRef.current.muted = false;
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (playerRef.current) {
            playerRef.current.volume = Math.max(0, playerRef.current.volume - 0.1);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerRef, toggleFullscreen, toggleMute, togglePlayPause]);

  const handleVolumeChange = useCallback(
    (_event: Event, newValue: number | number[]) => {
      if (!playerRef.current) return;
      const vol = typeof newValue === 'number' ? newValue : newValue[0];
      playerRef.current.muted = vol === 0 ? true : false;
      playerRef.current.volume = vol / 100;
      savePlayerSettings({ volume: vol, muted: playerRef.current.muted });
      setVolume(vol);
      setIsMuted(playerRef.current.muted);
      if (onUpdateSettings) onUpdateSettings({ volume: vol, muted: playerRef.current.muted });
    },
    [playerRef, onUpdateSettings]
  );

  const handleSeekChange = useCallback(
    (_event: Event, newValue: number | number[]) => {
      const seekValue = typeof newValue === 'number' ? newValue : newValue[0];
      if (playerRef.current) {
        playerRef.current.currentTime = seekValue;
        setCurrentTimeState(seekValue);
      }
    },
    [playerRef]
  );

  const handlePlaybackSpeedChange = useCallback(
    (speed: number) => {
      if (!playerRef.current) return;
      setPlaybackSpeed(speed);
      playerRef.current.playbackRate = speed;
    },
    [playerRef]
  );

  const handleError = useCallback(
    (_e: React.SyntheticEvent<HTMLVideoElement>) => {
      const video = playerRef.current;
      if (!video || !video.error) return;

      const code = video.error.code;
      switch (code) {
        case 1:
          setFileError('This video format is not supported by your browser');
          break;
        case 2:
          setFileError('Failed to decode the video file - it may be corrupted or use an unsupported codec');
          break;
        case 3:
          setFileError('Network error while loading the video - please check your connection');
          break;
        case 4:
          setFileError('Video loading was aborted');
          break;
        default:
          setFileError(`An error occurred while playing the video (Error code: ${code})`);
      }
    },
    [playerRef]
  );

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    setPlayerState(1);
    timeUpdate();
  }, [timeUpdate, setPlayerState]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    setPlayerState(2);
  }, [setPlayerState]);

  const handleEnded = useCallback(() => setPlayerState(0), [setPlayerState]);
  const handleWaiting = useCallback(() => setPlayerState(3), [setPlayerState]);
  const handlePlaying = useCallback(() => setPlayerState(1), [setPlayerState]);

  const handleLoadedMetadata = useCallback(() => {
    const dur = playerRef.current!.duration;
    setDuration(dur);

    const vodDuration = vod.duration;
    const tmpDelay = vodDuration - dur < 0 ? 0 : vodDuration - dur;
    setDelay?.(tmpDelay);
  }, [playerRef, vod.duration, setDelay]);

  useEffect(() => {
    if (source && playerRef.current) {
      canAutoplay.video({ inline: true }).then(async (obj: { result: boolean }) => {
        if (!playerRef.current) return;

        if (obj.result) return (playerRef.current.muted = isMuted);

        const mutedAutoplay = await canAutoplay.video({ muted: true, inline: true });
        if (!playerRef.current) return;

        if (mutedAutoplay.result) return (playerRef.current.muted = true);

        setIsPlaying(false);
      });
    }
  }, [source, playerRef, isMuted]);

  useEffect(() => {
    if (!source || !playerRef.current) return;

    if (type === 'manual') {
      playerRef.current.src = typeof source === 'string' ? source : source.src;
    } else if (typeof source === 'string' && source.endsWith('.mp4')) {
      playerRef.current.src = source;
    }

    const set = async () => {
      let playerDuration = playerRef.current!.duration;
      while (playerRef.current && (isNaN(playerDuration) || playerDuration === 0)) {
        playerDuration = playerRef.current.duration;
        await sleep(100);
      }
      if (!playerRef.current) return;
      const vodDuration = vod.duration;
      const tmpDelay = vodDuration - playerDuration < 0 ? 0 : vodDuration - playerDuration;
      setDelay?.(tmpDelay);
      setDuration(playerDuration);
    };

    set();
  }, [source, type, setDelay, vod.duration, playerRef]);

  useEffect(() => {
    if (!playerRef.current || source === undefined) return;
    playerRef.current.currentTime = 0;
  }, [source, playerRef]);

  const toggleTheatreMode = useCallback(() => {
    // This is handled by the parent component
  }, []);

  return {
    source,
    setSource,
    fileError,
    isPlaying,
    volume,
    isMuted,
    currentTime,
    duration,
    isFullscreen,
    playbackSpeed,
    isTouchDevice,
    playIconSize,
    toggleFullscreen,
    togglePlayPause,
    toggleMute,
    handleVolumeChange,
    handleSeekChange,
    handlePlaybackSpeedChange,
    handleError,
    toggleTheatreMode,
    timeUpdate,
    handlePlay,
    handlePause,
    handleEnded,
    handleWaiting,
    handlePlaying,
    handleLoadedMetadata,
  };
}
