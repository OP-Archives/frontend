import type {
  Tenant,
  VodData,
  VodDetail,
  GameData,
  LibraryGameItem,
  LibraryChapterItem,
  PaginatedApiResponse,
  ApiResponse,
  EmotesResponse,
  CommentsResponse,
  Badge,
} from '@/types';

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

function getApiBase(): string {
  const base = import.meta.env.VITE_API_BASE;
  if (!base) throw new Error('VITE_API_BASE environment variable is not set');
  return base;
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
): Promise<PaginatedApiResponse<VodData>> {
  const url = `${getApiBase()}/${slug}/vods?${buildParams(params)}`;
  return fetchJson(url, { signal: params.signal });
}

export async function listGames(
  slug: string,
  params: GameListParams & { signal?: AbortSignal } = {}
): Promise<PaginatedApiResponse<GameData>> {
  const url = `${getApiBase()}/${slug}/games?${buildParams(params)}`;
  return fetchJson(url, { signal: params.signal });
}

export async function getGamesLibrary(
  slug: string,
  params: LibraryParams & { signal?: AbortSignal } = {}
): Promise<PaginatedApiResponse<LibraryGameItem>> {
  const url = `${getApiBase()}/${slug}/games/library?${buildParams(params)}`;
  return fetchJson(url, { signal: params.signal });
}

export async function getChaptersLibrary(
  slug: string,
  params: LibraryParams & { signal?: AbortSignal } = {}
): Promise<PaginatedApiResponse<LibraryChapterItem>> {
  const url = `${getApiBase()}/${slug}/chapters/library?${buildParams(params)}`;
  return fetchJson(url, { signal: params.signal });
}

export const archiveClient = {
  tenants: {
    list: (params?: Record<string, string>) => {
      const query = new URLSearchParams(params).toString();
      return fetchJson<PaginatedApiResponse<Tenant>>(`${getApiBase()}/tenants${query ? `?${query}` : ''}`);
    },
    get: (slug: string) => fetchJson<ApiResponse<Tenant>>(`${getApiBase()}/tenants/${slug}`),
  },
  vods: {
    list: (slug: string, params?: Record<string, string>) => {
      const query = new URLSearchParams(params).toString();
      return fetchJson<PaginatedApiResponse<VodData>>(`${getApiBase()}/${slug}/vods${query ? `?${query}` : ''}`);
    },
    get: (slug: string, vodId: string, options?: { signal?: AbortSignal }) =>
      fetchJson<ApiResponse<VodDetail>>(`${getApiBase()}/${slug}/vods/${vodId}`, options || {}),
    emotes: (slug: string, vodId: string, options?: { signal?: AbortSignal }) =>
      fetchJson<ApiResponse<EmotesResponse>>(`${getApiBase()}/${slug}/vods/${vodId}/emotes`, options || {}),
    comments: (slug: string, vodId: string, params?: Record<string, string>) => {
      const query = new URLSearchParams(params || {}).toString();
      return fetchJson<ApiResponse<CommentsResponse>>(
        `${getApiBase()}/${slug}/vods/${vodId}/comments${query ? `?${query}` : ''}`
      );
    },
  },
  games: {
    list: (slug: string, params?: Record<string, string>) => {
      const query = new URLSearchParams(params).toString();
      return fetchJson<PaginatedApiResponse<GameData>>(`${getApiBase()}/${slug}/games${query ? `?${query}` : ''}`);
    },
    library: (slug: string, params?: Record<string, string>) => {
      const query = new URLSearchParams(params).toString();
      return fetchJson<PaginatedApiResponse<LibraryGameItem>>(
        `${getApiBase()}/${slug}/games/library${query ? `?${query}` : ''}`
      );
    },
  },
  chapters: {
    library: (slug: string, params?: Record<string, string>) => {
      const query = new URLSearchParams(params).toString();
      return fetchJson<PaginatedApiResponse<LibraryChapterItem>>(
        `${getApiBase()}/${slug}/chapters/library${query ? `?${query}` : ''}`
      );
    },
  },
  badges: {
    twitch: (slug: string) =>
      fetchJson<ApiResponse<{ channel: Badge[]; global: Badge[] }>>(`${getApiBase()}/${slug}/badges/twitch`),
  },
};
