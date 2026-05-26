import { useState, useEffect } from 'react';
import { loadPlayerSettings } from '@/utils/playerSettings';

interface UsePlayerStateOptions {
  playerRef: React.RefObject<HTMLVideoElement | null>;
  defaultVolume: number;
  defaultMuted: boolean;
}

export interface UsePlayerStateReturn {
  isPlaying: boolean;
  setIsPlaying: (v: boolean) => void;
  volume: number;
  setVolume: (v: number) => void;
  isMuted: boolean;
  setIsMuted: (v: boolean) => void;
  currentTime: number;
  setCurrentTime: (v: number) => void;
  duration: number;
  setDuration: (v: number) => void;
  isFullscreen: boolean;
  setIsFullscreen: (v: boolean) => void;
  playbackSpeed: number;
  setPlaybackSpeed: (v: number) => void;
  isTouchDevice: boolean;
  playIconSize: number;
  isBuffering: boolean;
  setIsBuffering: (v: boolean) => void;
}

export function usePlayerState({
  playerRef,
  defaultVolume,
  defaultMuted,
}: UsePlayerStateOptions): UsePlayerStateReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(defaultVolume || 100);
  const [isMuted, setIsMuted] = useState(defaultMuted || false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [playIconSize, setPlayIconSize] = useState(96);
  const [isBuffering, setIsBuffering] = useState(false);

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
        // eslint-disable-next-line react-compiler/react-compiler -- DOM mutation on video element
        playerRef.current.volume = (settings.volume ?? 100) / 100;

        playerRef.current.muted = settings.muted ?? false;
      }
    }
  }, []);

  return {
    isPlaying,
    setIsPlaying,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    isFullscreen,
    setIsFullscreen,
    playbackSpeed,
    setPlaybackSpeed,
    isTouchDevice,
    playIconSize,
    isBuffering,
    setIsBuffering,
  };
}
