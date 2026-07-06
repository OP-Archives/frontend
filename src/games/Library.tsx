import { useQueryClient, useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams, useParams } from 'react-router-dom';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { useDebouncedSetter } from '@/hooks/debounceHelper';
import { useChapters, prefetchNextPageChapters } from '@/hooks/useChapters';
import { useGamesLibrary, prefetchNextPageGamesLibrary } from '@/hooks/useGames';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Card } from '@/tenants/Card';
import type { LibraryGameItem, LibraryChapterItem } from '@/types';
import { archiveClient } from '@/utils/archive-client';

const SORTS = ['Recently Played', 'Most Played', 'Game Name'];

export function Library() {
  const { tenant } = useParams<{ tenant: string }>();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useMediaQuery('(max-width: 900px)');

  const { data: tenantData } = useQuery({
    queryKey: ['tenant', tenant],
    queryFn: () => archiveClient.tenants.get(tenant!),
    enabled: !!tenant,
    staleTime: 5 * 60 * 1000,
  });

  const isGames = tenantData?.data?.games !== false;
  const isChaptersMode = !isGames;

  const searchTerm = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'recent';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 21;

  const [inputSearch, setInputSearch] = useState(searchTerm);

  useEffect(() => {
    setInputSearch(searchTerm);
  }, [searchTerm]);

  const updateUrlParams = (updates: Record<string, string | null>) => {
    setSearchParams(
      (prev) => {
        const nextParams = new URLSearchParams(prev);
        for (const [key, val] of Object.entries(updates)) {
          if (val) nextParams.set(key, val);
          else nextParams.delete(key);
        }
        return nextParams;
      },
      { replace: true }
    );
  };

  const debouncedSetSearchTerm = useDebouncedSetter((val: string) => {
    updateUrlParams({ search: val, page: '1' });
  }, 500);

  const chaptersQueryKeyParams = useMemo(
    () => ({
      page,
      limit,
      ...(searchTerm.length > 0 ? { chapter_name: searchTerm } : {}),
      sort: (sort === 'recent' ? 'recent' : sort === 'count' ? 'count' : 'chapter_name') as
        'recent' | 'count' | 'chapter_name',
      order: (sort === 'game_name' ? 'asc' : 'desc') as 'asc' | 'desc',
    }),
    [page, limit, searchTerm, sort]
  );

  const gamesQueryKeyParams = useMemo(
    () => ({
      page,
      limit,
      ...(searchTerm.length > 0 ? { game_name: searchTerm } : {}),
      sort: (sort === 'recent' ? 'recent' : sort === 'count' ? 'count' : 'game_name') as
        'recent' | 'count' | 'game_name',
      order: (sort === 'game_name' ? 'asc' : 'desc') as 'asc' | 'desc',
    }),
    [page, limit, searchTerm, sort]
  );

  const chaptersResult = useChapters(tenant!, chaptersQueryKeyParams);
  const gamesResult = useGamesLibrary(tenant!, gamesQueryKeyParams);
  const { data, isLoading, isFetching } = isChaptersMode ? chaptersResult : gamesResult;
  const isBackgroundFetching = isFetching && !isLoading;

  const items = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.ceil((total || 0) / limit);

  useEffect(() => {
    if (totalPages !== null && page < totalPages) {
      if (isChaptersMode) {
        prefetchNextPageChapters(queryClient, { ...chaptersQueryKeyParams, slug: tenant! });
      } else {
        prefetchNextPageGamesLibrary(queryClient, { ...gamesQueryKeyParams, slug: tenant! });
      }
    }
  }, [page, totalPages, chaptersQueryKeyParams, gamesQueryKeyParams, queryClient, isChaptersMode]);

  const changeSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateUrlParams({ sort: e.target.value, page: '1' });
  };

  const handleClearSearch = () => {
    setInputSearch('');
    updateUrlParams({ search: null, page: '1' });
  };

  const heading = `${total} Games`;
  const emptyMessage = 'No games found';

  return (
    <div className="w-full py-1">
      <Helmet>
        <title>{`${tenantData?.data?.display_name || tenant} Library - op archive`}</title>
        <meta
          name="description"
          content={`Browse played games for ${tenantData?.data?.display_name || tenant} on op archive.`}
        />
      </Helmet>

      <div className="mt-2 flex flex-col items-center justify-center">
        {total !== null && (
          <div className="rounded-lg border border-[#222230] bg-[#16161e]/80 px-6 py-3">
            <h4 className="text-3xl font-medium text-[#6366f1] uppercase">{heading}</h4>
          </div>
        )}
      </div>
      <div className="max-w-full">
        <div className="flex flex-row flex-wrap items-center gap-2 pt-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by Game"
              onChange={(e) => {
                setInputSearch(e.target.value);
                debouncedSetSearchTerm(e.target.value);
              }}
              value={inputSearch}
              className="border-border bg-bg-surface text-text-primary placeholder-text-secondary hover:border-border/80 focus:border-primary focus:ring-primary/30 h-9 w-44 rounded-md border px-3 pr-8 text-sm transition-all duration-200 focus:ring-1 focus:outline-none"
            />
            {inputSearch && (
              <button
                onClick={handleClearSearch}
                className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer text-[#9ca3af] transition-colors hover:text-[#f0f0f5]"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <select
            value={sort}
            onChange={changeSort}
            className="border-border bg-bg-surface text-text-primary hover:border-border/80 focus:border-primary focus:ring-primary/30 ml-auto h-9 w-max rounded-md border px-3 text-sm transition-all duration-200 focus:ring-1 focus:outline-none"
          >
            {SORTS.map((data) => (
              <option
                key={data}
                value={data === 'Recently Played' ? 'recent' : data === 'Game Name' ? 'game_name' : 'count'}
              >
                {data}
              </option>
            ))}
          </select>
        </div>
      </div>
      {isLoading && (
        <div
          className="mt-2 grid gap-3"
          style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? 100 : 230}px, 1fr))` }}
        >
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="block min-w-0 rounded">
              <div
                className="relative w-full overflow-hidden rounded-t bg-[#16161e]"
                style={{ aspectRatio: '400/530' }}
              >
                <div className="absolute inset-0 animate-pulse bg-[#222230]" />
              </div>
              <div className="px-1 py-0.5 text-center">
                <span className="mx-auto block h-[16px] w-3/4 animate-pulse rounded bg-[#6366f1]/30" />
                <span className="mx-auto mt-0.5 block h-[16px] w-1/2 animate-pulse rounded bg-[#222230]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="mt-12 flex justify-center">
          <div className="rounded-lg border border-[#222230] bg-[#16161e]/80 px-6 py-3">
            <p className="text-center text-sm text-[#9ca3af]">{emptyMessage}</p>
          </div>
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <div
          className={`mt-2 grid gap-3 transition-opacity duration-200 ${isBackgroundFetching ? 'pointer-events-none opacity-50' : 'opacity-100'}`}
          style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? 100 : 230}px, 1fr))` }}
        >
          {items.map((item: LibraryGameItem | LibraryChapterItem) => (
            <div key={(item as LibraryGameItem).game_id || item.game_id}>
              <Card
                item={{
                  game_id: item.game_id,
                  game_name: isChaptersMode ? undefined : (item as LibraryGameItem).game_name,
                  name: isChaptersMode ? (item as LibraryChapterItem).name : undefined,
                  image: isChaptersMode ? (item as LibraryChapterItem).image : undefined,
                  chapter_image: isChaptersMode ? undefined : (item as LibraryGameItem).chapter_image,
                  count: item.count,
                }}
                type={isChaptersMode ? 'chapters' : 'games'}
              />
            </div>
          ))}
        </div>
      )}
      <div className="mt-6">
        <PaginationControls
          page={page}
          totalPages={totalPages}
          preserveParams={{
            ...(searchTerm ? { search: searchTerm } : {}),
            sort,
          }}
          onHoverPage={(targetPage) =>
            isChaptersMode
              ? prefetchNextPageChapters(queryClient, {
                  ...chaptersQueryKeyParams,
                  slug: tenant!,
                  page: targetPage,
                })
              : prefetchNextPageGamesLibrary(queryClient, {
                  ...gamesQueryKeyParams,
                  slug: tenant!,
                  page: targetPage,
                })
          }
        />
      </div>
    </div>
  );
}
