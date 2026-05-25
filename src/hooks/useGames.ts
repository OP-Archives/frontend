import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { PaginatedMeta, GameData } from '@/types';
import { archiveClient } from '@/utils/archive-client';

export interface GamesQueryParams {
  limit: number;
  page: number;
  sort?: string;
  order?: string;
  game_id?: string;
  from?: string;
  to?: string;
  game_name?: string;
}

export interface GamesListData {
  data: GameData[] | null;
  meta: PaginatedMeta | null;
}

function toRecord(params: GamesQueryParams): Record<string, string> {
  const record: Record<string, string> = {
    limit: String(params.limit),
    page: String(params.page),
  };
  if (params.sort) record.sort = params.sort;
  if (params.order) record.order = params.order;
  if (params.game_id) record.game_id = params.game_id;
  if (params.from) record.from = params.from;
  if (params.to) record.to = params.to;
  if (params.game_name) record.game_name = params.game_name;
  return record;
}

export function useGames(slug: string, params: GamesQueryParams) {
  return useQuery<GamesListData>({
    queryKey: ['games', slug, params],
    queryFn: ({ signal }) =>
      archiveClient.games.list(slug, toRecord(params), { signal }).then((r) => ({
        data: r.data,
        meta: r.meta as unknown as PaginatedMeta,
      })),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function prefetchNextPageGames(
  queryClient: ReturnType<typeof useQueryClient>,
  params: GamesQueryParams & { slug: string }
) {
  queryClient.prefetchQuery({
    queryKey: ['games', params.slug, params],
    queryFn: ({ signal }) =>
      archiveClient.games.list(params.slug, toRecord(params), { signal }).then((r) => ({
        data: r.data,
        meta: r.meta as unknown as PaginatedMeta,
      })),
    staleTime: 5 * 60 * 1000,
  });
}

export interface GamesLibraryParams {
  page: number;
  limit: number;
  game_name?: string;
  sort: 'recent' | 'game_name' | 'count';
  order: 'asc' | 'desc';
}

export interface GamesLibraryData {
  data: import('@/types').LibraryGameItem[] | null;
  meta: PaginatedMeta | null;
}

function libraryParamsToRecord(params: GamesLibraryParams): Record<string, string> {
  const record: Record<string, string> = {
    page: String(params.page),
    limit: String(params.limit),
  };
  if (params.game_name) record.game_name = params.game_name;
  record.sort = params.sort;
  record.order = params.order;
  return record;
}

export function useGamesLibrary(slug: string, params: GamesLibraryParams) {
  return useQuery<GamesLibraryData>({
    queryKey: ['games-library', slug, params],
    queryFn: () =>
      archiveClient.games.library(slug, libraryParamsToRecord(params)).then((r) => ({
        data: r.data,
        meta: r.meta as unknown as PaginatedMeta,
      })),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function prefetchNextPageGamesLibrary(
  queryClient: ReturnType<typeof useQueryClient>,
  params: GamesLibraryParams & { slug: string }
) {
  queryClient.prefetchQuery({
    queryKey: ['games-library', params.slug, params],
    queryFn: () =>
      archiveClient.games.library(params.slug, libraryParamsToRecord(params)).then((r) => ({
        data: r.data,
        meta: r.meta as unknown as PaginatedMeta,
      })),
    staleTime: 5 * 60 * 1000,
  });
}
