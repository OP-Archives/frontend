import { API_TIMEOUT_MS } from './constants';
import type {
  Tenant,
  VodListItem,
  VodDetail,
  GameData,
  LibraryGameItem,
  LibraryChapterItem,
  PaginatedApiResponse,
  ApiResponse,
  EmotesResponse,
  CommentsResponse,
  Badge,
  RecentVod,
} from '@/types';

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

interface RequestOptions {
  signal?: AbortSignal;
}

function getApiBase(): string {
  const base = import.meta.env.VITE_API_BASE;
  if (!base) throw new Error('VITE_API_BASE environment variable is not set');
  return base;
}

async function fetchJson<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), API_TIMEOUT_MS);

  let signal: AbortSignal = timeoutController.signal;
  if (options.signal) {
    const combined = new AbortController();
    const handler = () => combined.abort();
    options.signal.addEventListener('abort', handler, { once: true });
    timeoutController.signal.addEventListener('abort', () => combined.abort(), { once: true });
    signal = combined.signal;
  }

  try {
    const res = await window.fetch(url, {
      ...options,
      signal,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`API error ${res.status} ${res.statusText}: ${body.slice(0, 200)}`);
    }
    return res.json() as Promise<T>;
  } finally {
    clearTimeout(timeoutId);
  }
}

function buildQuery(params: Record<string, unknown>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '' && key !== 'signal') {
      query.set(key, String(value));
    }
  }
  return query.toString();
}

export const archiveClient = {
  tenants: {
    list: (params?: Record<string, string>) => {
      const query = buildQuery(params || {});
      return fetchJson<PaginatedApiResponse<Tenant>>(`${getApiBase()}/tenants${query ? `?${query}` : ''}`);
    },
    get: (slug: string) => fetchJson<ApiResponse<Tenant>>(`${getApiBase()}/tenants/${slug}`),
  },
  vods: {
    list: (slug: string, params?: Record<string, string>, options?: RequestOptions) => {
      const query = buildQuery(params || {});
      return fetchJson<PaginatedApiResponse<VodListItem>>(
        `${getApiBase()}/${slug}/vods${query ? `?${query}` : ''}`,
        options
      );
    },
    get: (slug: string, vodId: string, options?: RequestOptions) =>
      fetchJson<ApiResponse<VodDetail>>(`${getApiBase()}/${slug}/vods/${vodId}`, options),
    emotes: (slug: string, vodId: string, options?: RequestOptions) =>
      fetchJson<ApiResponse<EmotesResponse>>(`${getApiBase()}/${slug}/vods/${vodId}/emotes`, options),
    comments: (slug: string, vodId: string, params?: Record<string, string>) => {
      const query = buildQuery(params || {});
      return fetchJson<ApiResponse<CommentsResponse>>(
        `${getApiBase()}/${slug}/vods/${vodId}/comments${query ? `?${query}` : ''}`
      );
    },
    recent: () => fetchJson<ApiResponse<RecentVod[]>>(`${getApiBase()}/vods/recent`),
  },
  games: {
    list: (slug: string, params?: Record<string, string>, options?: RequestOptions) => {
      const query = buildQuery(params || {});
      return fetchJson<PaginatedApiResponse<GameData>>(
        `${getApiBase()}/${slug}/games${query ? `?${query}` : ''}`,
        options
      );
    },
    library: (slug: string, params?: Record<string, string>) => {
      const query = buildQuery(params || {});
      return fetchJson<PaginatedApiResponse<LibraryGameItem>>(
        `${getApiBase()}/${slug}/games/library${query ? `?${query}` : ''}`
      );
    },
  },
  chapters: {
    library: (slug: string, params?: Record<string, string>, options?: RequestOptions) => {
      const query = buildQuery(params || {});
      return fetchJson<PaginatedApiResponse<LibraryChapterItem>>(
        `${getApiBase()}/${slug}/chapters/library${query ? `?${query}` : ''}`,
        options
      );
    },
  },
  badges: {
    twitch: (slug: string) =>
      fetchJson<ApiResponse<{ channel: Badge[]; global: Badge[] }>>(`${getApiBase()}/${slug}/badges/twitch`),
    kick: (slug: string) =>
      fetchJson<ApiResponse<{ subscriber: Record<string, string> }>>(`${getApiBase()}/${slug}/badges/kick`),
  },
};
