import { parse } from 'tinyduration';

export const convertTimestamp = (timestamp: string): number => {
  try {
    const duration = parse(`PT${timestamp.toUpperCase()}`);
    return (duration?.hours || 0) * 60 * 60 + (duration?.minutes || 0) * 60 + (duration?.seconds || 0);
  } catch {
    return 0;
  }
};

export const toSeconds = (hms: string): number => {
  const p = hms.split(':');
  let s = 0;
  let m = 1;

  while (p.length > 0) {
    s += m * parseInt(p.pop()!, 10);
    m *= 60;
  }

  return s;
};

export const toHMS = (secs: number): string => {
  const sec_num = parseInt(secs.toString(), 10);
  const hours = Math.floor(sec_num / 3600);
  const minutes = Math.floor(sec_num / 60) % 60;
  const seconds = sec_num % 60;

  return `${hours}h${minutes}m${seconds}s`;
};

export const toHHMMSS = (secs: number): string => {
  const sec_num = parseInt(secs.toString(), 10);
  const h = Math.floor(sec_num / 3600);
  const m = Math.floor(sec_num / 60) % 60;
  const s = sec_num % 60;

  const mStr = m < 10 ? `0${m}` : m;
  const sStr = s < 10 ? `0${s}` : s;

  return h > 0 ? `${h}:${mStr}:${sStr}` : `${mStr}:${sStr}`;
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getImage = (link: string | undefined, width: number = 40, height: number = 53): string => {
  if (!link) return 'https://static-cdn.jtvnw.net/ttv-static/404_boxart.jpg';
  return link.replace('{width}x{height}', `${width}x${height}`);
};

export const formatTime = (time: number | undefined): string => {
  const isTimeNaN = isNaN(time as number);
  const hours = !isTimeNaN ? Math.floor((time as number) / 3600) : 0,
    remainder = !isTimeNaN ? (time as number) % 3600 : 0,
    minutes = !isTimeNaN ? Math.floor(remainder / 60) : 0,
    seconds = !isTimeNaN ? Math.floor(remainder % 60) : 0;

  let hh: string | undefined;
  const mm = minutes.toString().padStart(2, '0');
  const ss = seconds.toString().padStart(2, '0');
  if (hours !== 0) hh = hours.toString().padStart(2, '0');

  return `${hh ? `${hh}:` : ''}${mm}:${ss}`;
};
