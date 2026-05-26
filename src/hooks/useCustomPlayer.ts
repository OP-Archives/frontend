import { useHlsPlayer } from './useHlsPlayer';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { usePlayerState } from './usePlayerState';
import { useVideoControls } from './useVideoControls';
import type { VodDetail, PlayerSource, PlayerState, PlayerSettings } from '@/types';

interface UseCustomPlayerOptions {
  type?: string;
  vod: VodDetail;
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
  isBuffering: boolean;
  toggleFullscreen: () => void;
  togglePiP: () => void;
  togglePlayPause: () => void;
  toggleMute: () => void;
  handleVolumeChange: (_event: Event, newValue: number | number[]) => void;
  handleSeekChange: (_event: Event, newValue: number | number[]) => void;
  handlePlaybackSpeedChange: (speed: number) => void;
  handleError: (_e: React.SyntheticEvent<HTMLVideoElement>) => void;
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
  setDelay,
  setPlayerState,
  defaultVolume,
  defaultMuted,
  onUpdateSettings,
}: UseCustomPlayerOptions): UseCustomPlayerReturn {
  const playerState = usePlayerState({
    playerRef,
    defaultVolume,
    defaultMuted,
  });

  const hlsPlayer = useHlsPlayer({
    type,
    cdnBase,
    platformVodId: vod.platform_vod_id,
    playerRef,
  });

  const videoControls = useVideoControls({
    type,
    playerRef,
    isTouchDevice: playerState.isTouchDevice,
    isMuted: playerState.isMuted,
    source: hlsPlayer.source,
    vodDuration: vod.duration,
    setDelay,
    onUpdateSettings,
    setIsPlaying: playerState.setIsPlaying,
    setIsBuffering: playerState.setIsBuffering,
    setPlayerState,
    setCurrentTime: playerState.setCurrentTime,
    setDuration: playerState.setDuration,
    setIsMuted: playerState.setIsMuted,
    setVolume: playerState.setVolume,
    setPlaybackSpeed: playerState.setPlaybackSpeed,
    setIsFullscreen: playerState.setIsFullscreen,
  });

  useKeyboardShortcuts({
    playerRef,
    toggleFullscreen: videoControls.toggleFullscreen,
    toggleMute: videoControls.toggleMute,
    togglePlayPause: videoControls.togglePlayPause,
  });

  return {
    ...hlsPlayer,
    ...playerState,
    ...videoControls,
  } as UseCustomPlayerReturn;
}
