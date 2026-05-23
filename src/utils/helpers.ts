import { format } from 'date-fns';

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function formatViews(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return String(count);
}

export function formatDate(date: string | number | Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days < 1) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return format(new Date(date), 'MMM d, yyyy');
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

export function getImage(link: string | undefined, width = 40, height = 53): string {
  if (!link) return 'https://static-cdn.jtvnw.net/ttv-static/404_boxart.jpg';
  return link.replace('{width}x{height}', `${width}x${height}`);
}
