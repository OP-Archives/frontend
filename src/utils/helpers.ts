import { parse } from 'tinyduration';

export function convertTimestamp(timestamp: string): number {
  try {
    const duration = parse(`PT${timestamp.toUpperCase()}`);
    return (duration?.hours || 0) * 60 * 60 + (duration?.minutes || 0) * 60 + (duration?.seconds || 0);
  } catch {
    return 0;
  }
}

export function toSeconds(hms: string): number {
  const p = hms.split(':');
  let s = 0;
  let m = 1;

  while (p.length > 0) {
    s += m * parseInt(p.pop()!, 10);
    m *= 60;
  }

  return s;
}

export function formatTime(time: number | undefined): string {
  if (time == null || isNaN(time)) return '00:00';
  const hours = Math.floor(time / 3600);
  const remainder = time % 3600;
  const minutes = Math.floor(remainder / 60);
  const seconds = Math.floor(remainder % 60);
  const mm = minutes.toString().padStart(2, '0');
  const ss = seconds.toString().padStart(2, '0');
  return hours > 0 ? `${hours.toString().padStart(2, '0')}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function toHMS(secs: number | string): string {
  const sec_num = parseInt(String(secs), 10);
  const hours = Math.floor(sec_num / 3600);
  const minutes = Math.floor(sec_num / 60) % 60;
  const seconds = sec_num % 60;
  return `${hours}h${minutes}m${seconds}s`;
}

export function toHHMMSS(secs: number | string): string {
  const sec_num = parseInt(String(secs), 10);
  const hours = Math.floor(sec_num / 3600);
  const minutes = Math.floor(sec_num / 60) % 60;
  const seconds = sec_num % 60;
  return [hours, minutes, seconds]
    .map((v) => (v < 10 ? '0' + v : String(v)))
    .filter((v, i) => v !== '00' || i > 0)
    .join(':');
}

export function getImage(link: string | undefined, width = 40, height = 53, gameId?: string): string {
  if (!link) {
    if (gameId) return `https://static-cdn.jtvnw.net/ttv-boxart/${gameId}_IGDB-${width}x${height}.jpg`;
    return `https://static-cdn.jtvnw.net/ttv-static/404_boxart-${width}x${height}.jpg`;
  }
  return link.replace('{width}x{height}', `${width}x${height}`);
}
