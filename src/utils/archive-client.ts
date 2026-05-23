import type {
  Tenant,
  VodData,
  Vod,
  GameData,
  LibraryGameItem,
  LibraryChapterItem,
  ApiResponse,
  PaginatedResponse,
  EmotesResponse,
  CommentsResponse,
  Badge,
} from '@/types';

const apiBase = (() => {
  const base = import.meta.env.VITE_API_BASE;
  if (!base) throw new Error('VITE_API_BASE environment variable is not set');
  return base;
})();

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

interface ListParams {
  platform?: string;
  from?: string;
  to?: string;
  uploaded?: string;
  game?: string;
  game_id?: string;
  title?: string;
  chapter?: string;
  page?: number | string;
  limit?: number | string;
  sort?: string;
  order?: string;
}

interface GameListParams {
  game_name?: string;
  title?: string;
  platform?: string;
  from?: string;
  to?: string;
  game_id?: string;
  page?: number | string;
  limit?: number | string;
  sort?: string;
  order?: string;
}

interface LibraryParams {
  game_id?: string;
  game_name?: string;
  chapter_name?: string;
  sort?: string;
  order?: string;
  page?: number | string;
  limit?: number | string;
}

const buildParams = (params: object) => {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '' && key !== 'signal') {
      query.set(key, String(value));
    }
  }
  return query;
};

async function fetchJson<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), 8000);

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
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json() as Promise<T>;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function listVods(
  slug: string,
  params: ListParams & { signal?: AbortSignal } = {}
): Promise<ApiResponse<VodData[]>> {
  const url = `${apiBase}/${slug}/vods?${buildParams(params)}`;
  return fetchJson(url, { signal: params.signal });
}

export async function listGames(
  slug: string,
  params: GameListParams & { signal?: AbortSignal } = {}
): Promise<ApiResponse<GameData[]>> {
  const url = `${apiBase}/${slug}/games?${buildParams(params)}`;
  return fetchJson(url, { signal: params.signal });
}

export async function getGamesLibrary(
  slug: string,
  params: LibraryParams & { signal?: AbortSignal } = {}
): Promise<ApiResponse<LibraryGameItem[]>> {
  const url = `${apiBase}/${slug}/games/library?${buildParams(params)}`;
  return fetchJson(url, { signal: params.signal });
}

export async function getChaptersLibrary(
  slug: string,
  params: LibraryParams & { signal?: AbortSignal } = {}
): Promise<ApiResponse<LibraryChapterItem[]>> {
  const url = `${apiBase}/${slug}/chapters/library?${buildParams(params)}`;
  return fetchJson(url, { signal: params.signal });
}

export const archiveClient = {
  tenants: {
    list: (params?: Record<string, string>) => {
      const query = new URLSearchParams(params).toString();
      return fetchJson<PaginatedResponse<Tenant>>(`${apiBase}/tenants${query ? `?${query}` : ''}`);
    },
    get: (slug: string) => fetchJson<ApiResponse<Tenant>>(`${apiBase}/tenants/${slug}`),
  },
  vods: {
    list: (slug: string, params?: Record<string, string>) => {
      const query = new URLSearchParams(params).toString();
      return fetchJson<PaginatedResponse<VodData>>(`${apiBase}/${slug}/vods${query ? `?${query}` : ''}`);
    },
    get: (slug: string, vodId: string, options?: { signal?: AbortSignal }) =>
      fetchJson<ApiResponse<Vod>>(`${apiBase}/${slug}/vods/${vodId}`, options || {}),
    emotes: (slug: string, vodId: string, options?: { signal?: AbortSignal }) =>
      fetchJson<ApiResponse<EmotesResponse>>(`${apiBase}/${slug}/vods/${vodId}/emotes`, options || {}),
    comments: (slug: string, vodId: string, params?: Record<string, string>) => {
      const query = new URLSearchParams(params || {}).toString();
      return fetchJson<ApiResponse<CommentsResponse>>(
        `${apiBase}/${slug}/vods/${vodId}/comments${query ? `?${query}` : ''}`
      );
    },
  },
  games: {
    list: (slug: string, params?: Record<string, string>) => {
      const query = new URLSearchParams(params).toString();
      return fetchJson<PaginatedResponse<GameData>>(`${apiBase}/${slug}/games${query ? `?${query}` : ''}`);
    },
    library: (slug: string, params?: Record<string, string>) => {
      const query = new URLSearchParams(params).toString();
      return fetchJson<PaginatedResponse<LibraryGameItem>>(
        `${apiBase}/${slug}/games/library${query ? `?${query}` : ''}`
      );
    },
  },
  chapters: {
    library: (slug: string, params?: Record<string, string>) => {
      const query = new URLSearchParams(params).toString();
      return fetchJson<PaginatedResponse<LibraryChapterItem>>(
        `${apiBase}/${slug}/chapters/library${query ? `?${query}` : ''}`
      );
    },
  },
  badges: {
    twitch: (slug: string) =>
      fetchJson<ApiResponse<{ channel: Badge[]; global: Badge[] }>>(`${apiBase}/${slug}/badges/twitch`),
  },
};
