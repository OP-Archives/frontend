import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { VodData, PaginatedApiResponse } from '@/types';
import { archiveClient, listVods } from '@/utils/archive-client';

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
  data: VodData[] | null;
  meta: PaginatedApiResponse<VodData>['meta'] | null;
}

export function useVods(slug: string, params: VodsQueryParams) {
  return useQuery<VodsListData>({
    queryKey: ['vods', slug, params],
    queryFn: ({ signal }) => listVods(slug, { ...params, signal }),
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
    queryFn: ({ signal }) => listVods(params.slug, { ...params, signal }),
    staleTime: 5 * 60 * 1000,
  });
}

export function useVod(slug: string, vodId: string) {
  return useQuery({
    queryKey: ['vods', slug, vodId],
    queryFn: async () => {
      const res = await archiveClient.vods.get(slug, vodId);
      return res.data;
    },
    enabled: !!(slug && vodId),
  });
}

export function useVodEmotes(slug: string, vodId: string) {
  return useQuery({
    queryKey: ['vods', slug, vodId, 'emotes'],
    queryFn: async () => {
      const res = await archiveClient.vods.emotes(slug, vodId);
      return res.data;
    },
    enabled: !!(slug && vodId),
  });
}

export function useVodComments(slug: string, vodId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['vods', slug, vodId, 'comments', params],
    queryFn: async () => {
      const res = await archiveClient.vods.comments(slug, vodId, params);
      return res.data;
    },
    enabled: !!(slug && vodId),
  });
}
