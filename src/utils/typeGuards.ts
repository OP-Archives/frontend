export function isNativeVideo(player: unknown): player is HTMLVideoElement {
  if (typeof player !== 'object' || player === null) return false;
  const el = player as Record<string, unknown>;
  return 'paused' in el && 'currentTime' in el && 'play' in el && 'pause' in el && 'muted' in el && 'volume' in el;
}

export function hasGetCurrentTime(player: unknown): player is { getCurrentTime(): number } {
  return typeof (player as { getCurrentTime?: () => number })?.getCurrentTime === 'function';
}

export function hasWebkitRequestFullscreen(
  el: unknown
): el is HTMLElement & { webkitRequestFullscreen?: () => Promise<void> } {
  return typeof (el as { webkitRequestFullscreen?: () => void })?.webkitRequestFullscreen === 'function';
}

export function hasWebkitEnterFullscreen(el: unknown): el is HTMLVideoElement & { webkitEnterFullscreen?: () => void } {
  return typeof (el as { webkitEnterFullscreen?: () => void })?.webkitEnterFullscreen === 'function';
}
