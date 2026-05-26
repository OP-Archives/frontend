import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { VodListItem, PaginatedApiResponse } from '@/types';
import { unwrap } from '@/utils/api';
import { archiveClient } from '@/utils/archive-client';

export interface VodsQueryParams {
  limit: number;
  page: number;
  sort?: string;
  order?: string;
  game_id?: string;
  platform?: string;
  from?: string;
  to?: string;
  title?: string;
  chapter?: string;
}

export interface VodsListData {
  data: VodListItem[] | null;
  meta: PaginatedApiResponse<VodListItem>['meta'] | null;
}

function toRecord(params: VodsQueryParams): Record<string, string> {
  const record: Record<string, string> = {
    limit: String(params.limit),
    page: String(params.page),
  };
  if (params.sort) record.sort = params.sort;
  if (params.order) record.order = params.order;
  if (params.game_id) record.game_id = params.game_id;
  if (params.platform) record.platform = params.platform;
  if (params.from) record.from = params.from;
  if (params.to) record.to = params.to;
  if (params.title) record.title = params.title;
  if (params.chapter) record.chapter = params.chapter;
  return record;
}

export function useVods(slug: string, params: VodsQueryParams) {
  return useQuery<VodsListData>({
    queryKey: ['vods', slug, params],
    queryFn: ({ signal }) =>
      archiveClient.vods.list(slug, toRecord(params), { signal }).then((r) => ({
        data: r.data,
        meta: r.meta,
      })),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function prefetchNextPageVods(
  queryClient: ReturnType<typeof useQueryClient>,
  params: VodsQueryParams & { slug: string }
) {
  queryClient.prefetchQuery({
    queryKey: ['vods', params.slug, params],
    queryFn: ({ signal }) =>
      archiveClient.vods.list(params.slug, toRecord(params), { signal }).then((r) => ({
        data: r.data,
        meta: r.meta,
      })),
    staleTime: 5 * 60 * 1000,
  });
}

export function useVod(slug: string, vodId: string) {
  return useQuery({
    queryKey: ['vods', slug, vodId],
    queryFn: async ({ signal }) => unwrap(archiveClient.vods.get(slug, vodId, { signal })),
    enabled: !!(slug && vodId),
  });
}

export function useVodEmotes(slug: string, vodId: string) {
  return useQuery({
    queryKey: ['vods', slug, vodId, 'emotes'],
    queryFn: async () => unwrap(archiveClient.vods.emotes(slug, vodId)),
    enabled: !!(slug && vodId),
  });
}

export function useVodComments(slug: string, vodId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['vods', slug, vodId, 'comments', params],
    queryFn: async () => unwrap(archiveClient.vods.comments(slug, vodId, params)),
    enabled: !!(slug && vodId),
  });
}
