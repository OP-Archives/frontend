import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { PaginatedMeta, LibraryChapterItem } from '@/types';
import { archiveClient } from '@/utils/archive-client';

export interface ChaptersParams {
  page: number;
  limit: number;
  chapter_name?: string;
  sort: 'recent' | 'game_name' | 'count';
  order: 'asc' | 'desc';
}

export interface ChaptersLibraryData {
  data: LibraryChapterItem[] | null;
  meta: PaginatedMeta | null;
}

function chaptersParamsToRecord(params: ChaptersParams): Record<string, string> {
  const record: Record<string, string> = {
    page: String(params.page),
    limit: String(params.limit),
  };
  if (params.chapter_name && params.chapter_name.length > 0) {
    record.chapter_name = params.chapter_name;
  }
  record.sort = params.sort;
  record.order = params.order;
  return record;
}

export function useChapters(slug: string, params: ChaptersParams) {
  return useQuery<ChaptersLibraryData>({
    queryKey: ['chapters', slug, params],
    queryFn: ({ signal }) =>
      archiveClient.chapters.library(slug, chaptersParamsToRecord(params), { signal }).then((r) => ({
        data: r.data,
        meta: r.meta as unknown as PaginatedMeta,
      })),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function prefetchNextPageChapters(
  queryClient: ReturnType<typeof useQueryClient>,
  params: ChaptersParams & { slug: string }
) {
  queryClient.prefetchQuery({
    queryKey: ['chapters', params.slug, params],
    queryFn: ({ signal }) =>
      archiveClient.chapters.library(params.slug, chaptersParamsToRecord(params), { signal }).then((r) => ({
        data: r.data,
        meta: r.meta as unknown as PaginatedMeta,
      })),
    staleTime: 5 * 60 * 1000,
  });
}
