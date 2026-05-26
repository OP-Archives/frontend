import { useState, useEffect, useRef, useCallback } from 'react';
import { formatTime } from '@/utils/helpers';

const AUTO_HIDE_DELAY = 3000;

interface UsePlayerControlsOptions {
  isPlaying: boolean;
  playerContainerRef: React.RefObject<HTMLDivElement | null>;
  duration: number;
}

export interface UsePlayerControlsReturn {
  showControls: boolean;
  isMenuOpen: boolean;
  setIsMenuOpen: (v: boolean) => void;
  settingsAnchorEl: HTMLElement | null;
  setSettingsAnchorEl: (v: HTMLElement | null) => void;
  showSpeedMenu: boolean;
  setShowSpeedMenu: (v: boolean) => void;
  menuMaxHeight: number;
  setMenuMaxHeight: (v: number) => void;
  progressTooltipRef: React.RefObject<HTMLDivElement | null>;
  volumeTooltipRef: React.RefObject<HTMLDivElement | null>;
  settingsMenuRef: React.RefObject<HTMLDivElement | null>;
  handleProgressMouseMove: (e: React.MouseEvent<HTMLInputElement>) => void;
  handleProgressTouchMove: (e: React.TouchEvent<HTMLInputElement>) => void;
  handleProgressTouchEnd: () => void;
  handleProgressMouseLeave: () => void;
  handleVolumeMouseMove: (e: React.MouseEvent<HTMLInputElement>) => void;
  handleVolumeTouchMove: (e: React.TouchEvent<HTMLInputElement>) => void;
  handleVolumeTouchEnd: () => void;
  handleVolumeMouseLeave: () => void;
  handleVolumeMouseUp: () => void;
  handleVolumeMouseDown: () => void;
  handleCloseSettings: () => void;
}

export function usePlayerControls({
  isPlaying,
  playerContainerRef,
  duration,
}: UsePlayerControlsOptions): UsePlayerControlsReturn {
  const [showControls, setShowControls] = useState(true);
  const [isMenuOpen, _setIsMenuOpen] = useState(false);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<HTMLElement | null>(null);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [menuMaxHeight, setMenuMaxHeight] = useState(250);
  const settingsMenuRef = useRef<HTMLDivElement | null>(null);
  const autoHideTimerRef = useRef<number | null>(null);
  const closeSettingsTimerRef = useRef<number | null>(null);
  const progressTooltipRef = useRef<HTMLDivElement | null>(null);
  const volumeTooltipRef = useRef<HTMLDivElement | null>(null);
  const isDraggingVolume = useRef(false);

  const setIsMenuOpen = useCallback((v: boolean) => {
    _setIsMenuOpen(v);
  }, []);

  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);

      if (!isMenuOpen) {
        autoHideTimerRef.current = setTimeout(() => {
          if (isPlaying) {
            setShowControls(false);
          }
        }, AUTO_HIDE_DELAY);
      }
    };

    const handleMouseLeave = () => {
      if (isPlaying && !isMenuOpen) {
        setShowControls(false);
      }
    };

    const playerContainer = playerContainerRef.current;
    if (playerContainer) {
      playerContainer.addEventListener('mousemove', handleMouseMove);
      playerContainer.addEventListener('mouseleave', handleMouseLeave);
      playerContainer.addEventListener('click', handleMouseMove);
    }

    if (isMenuOpen) {
      if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
      setShowControls(true);
    } else if (isPlaying) {
      if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
      autoHideTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, AUTO_HIDE_DELAY);
    }

    return () => {
      if (playerContainer) {
        playerContainer.removeEventListener('mousemove', handleMouseMove);
        playerContainer.removeEventListener('mouseleave', handleMouseLeave);
        playerContainer.removeEventListener('click', handleMouseMove);
      }
      if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
    };
  }, [isPlaying, isMenuOpen, playerContainerRef]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        settingsMenuRef.current &&
        !settingsMenuRef.current.contains(event.target as Node) &&
        settingsAnchorEl &&
        !settingsAnchorEl.contains(event.target as Node)
      ) {
        handleCloseSettings();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen, settingsAnchorEl]);

  useEffect(() => {
    return () => {
      if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
      if (closeSettingsTimerRef.current) clearTimeout(closeSettingsTimerRef.current);
    };
  }, []);

  const handleCloseSettings = useCallback(() => {
    setIsMenuOpen(false);

    closeSettingsTimerRef.current = setTimeout(() => {
      setSettingsAnchorEl(null);
      setShowSpeedMenu(false);
    }, 250);
  }, [setIsMenuOpen]);

  const handleProgressMouseMove = useCallback(
    (e: React.MouseEvent<HTMLInputElement>) => {
      if (!progressTooltipRef.current) return;

      const rect = (e.target as HTMLInputElement).getBoundingClientRect();
      const pos = Math.max(0, Math.min(e.clientX - rect.left, rect.width));

      const percentage = pos / rect.width;
      const TOOLTIP_HALF_WIDTH = 30;
      const clampedPos = Math.max(TOOLTIP_HALF_WIDTH, Math.min(pos, rect.width - TOOLTIP_HALF_WIDTH));

      progressTooltipRef.current.style.left = `${clampedPos}px`;
      progressTooltipRef.current.innerText = formatTime(percentage * duration);
      progressTooltipRef.current.style.opacity = '1';
    },
    [duration]
  );

  const handleProgressTouchMove = useCallback(
    (e: React.TouchEvent<HTMLInputElement>) => {
      if (!progressTooltipRef.current || !e.touches[0]) return;

      const rect = (e.target as HTMLInputElement).getBoundingClientRect();
      const pos = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));

      const percentage = pos / rect.width;
      const TOOLTIP_HALF_WIDTH = 30;
      const clampedPos = Math.max(TOOLTIP_HALF_WIDTH, Math.min(pos, rect.width - TOOLTIP_HALF_WIDTH));

      progressTooltipRef.current.style.left = `${clampedPos}px`;
      progressTooltipRef.current.innerText = formatTime(percentage * duration);
      progressTooltipRef.current.style.opacity = '1';
    },
    [duration]
  );

  const handleProgressTouchEnd = useCallback(() => {
    if (progressTooltipRef.current) progressTooltipRef.current.style.opacity = '0';
  }, []);

  const handleProgressMouseLeave = useCallback(() => {
    if (progressTooltipRef.current) progressTooltipRef.current.style.opacity = '0';
  }, []);

  const handleVolumeMouseMove = useCallback((e: React.MouseEvent<HTMLInputElement>) => {
    if (!isDraggingVolume.current || !volumeTooltipRef.current) return;

    const rect = (e.target as HTMLInputElement).getBoundingClientRect();
    const pos = Math.max(0, Math.min(e.clientX - rect.left, rect.width));

    const percentage = pos / rect.width;
    const TOOLTIP_HALF_WIDTH = 20;
    const clampedPos = Math.max(TOOLTIP_HALF_WIDTH, Math.min(pos, rect.width - TOOLTIP_HALF_WIDTH));

    volumeTooltipRef.current.style.left = `${clampedPos}px`;
    volumeTooltipRef.current.innerText = `${Math.round(percentage * 100)}%`;
    volumeTooltipRef.current.style.opacity = '1';
  }, []);

  const handleVolumeTouchMove = useCallback((e: React.TouchEvent<HTMLInputElement>) => {
    if (!volumeTooltipRef.current || !e.touches[0]) return;

    const rect = (e.target as HTMLInputElement).getBoundingClientRect();
    const pos = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));

    const percentage = pos / rect.width;
    const TOOLTIP_HALF_WIDTH = 20;
    const clampedPos = Math.max(TOOLTIP_HALF_WIDTH, Math.min(pos, rect.width - TOOLTIP_HALF_WIDTH));

    volumeTooltipRef.current.style.left = `${clampedPos}px`;
    volumeTooltipRef.current.innerText = `${Math.round(percentage * 100)}%`;
    volumeTooltipRef.current.style.opacity = '1';
  }, []);

  const handleVolumeTouchEnd = useCallback(() => {
    isDraggingVolume.current = false;
    if (volumeTooltipRef.current) volumeTooltipRef.current.style.opacity = '0';
  }, []);

  const handleVolumeMouseLeave = useCallback(() => {
    isDraggingVolume.current = false;
    if (volumeTooltipRef.current) volumeTooltipRef.current.style.opacity = '0';
  }, []);

  const handleVolumeMouseUp = useCallback(() => {
    isDraggingVolume.current = false;
    if (volumeTooltipRef.current) volumeTooltipRef.current.style.opacity = '0';
  }, []);

  const handleVolumeMouseDown = useCallback(() => {
    isDraggingVolume.current = true;
  }, []);

  return {
    showControls,
    isMenuOpen,
    setIsMenuOpen,
    settingsAnchorEl,
    setSettingsAnchorEl,
    showSpeedMenu,
    setShowSpeedMenu,
    menuMaxHeight,
    setMenuMaxHeight,
    progressTooltipRef,
    volumeTooltipRef,
    settingsMenuRef,
    handleProgressMouseMove,
    handleProgressTouchMove,
    handleProgressTouchEnd,
    handleProgressMouseLeave,
    handleVolumeMouseMove,
    handleVolumeTouchMove,
    handleVolumeTouchEnd,
    handleVolumeMouseLeave,
    handleVolumeMouseUp,
    handleVolumeMouseDown,
    handleCloseSettings,
  };
}
