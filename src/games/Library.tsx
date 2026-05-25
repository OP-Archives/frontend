import { useQueryClient, useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { useState, useEffect, startTransition } from 'react';
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
  const limit = isMobile ? 10 : 20;

  const [inputSearch, setInputSearch] = useState(searchTerm);

  useEffect(() => {
    setInputSearch(searchTerm);
  }, [searchTerm]);

  const updateUrlParams = (updates: Record<string, string | null>) => {
    startTransition(() => {
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
    });
  };

  const debouncedSetSearchTerm = useDebouncedSetter((val: string) => {
    updateUrlParams({ search: val, page: '1' });
  }, 500);

  const apiSort = sort === 'recent' ? 'recent' : sort === 'game_name' ? 'game_name' : 'count';
  const apiOrder = sort === 'game_name' ? 'asc' : 'desc';

  const searchParamKey = isChaptersMode ? 'chapter_name' : 'game_name';

  const queryKeyParams = {
    page,
    limit,
    ...(searchTerm.length > 0 ? { [searchParamKey]: searchTerm } : {}),
    sort: apiSort as 'recent' | 'game_name' | 'count',
    order: apiOrder as 'asc' | 'desc',
  };

  const chaptersResult = useChapters(tenant!, queryKeyParams);
  const gamesResult = useGamesLibrary(tenant!, queryKeyParams);
  const { data, isLoading, isFetching } = isChaptersMode ? chaptersResult : gamesResult;

  const items = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.ceil((total || 0) / limit);
  const isBackgroundFetching = isFetching && !isLoading;

  useEffect(() => {
    if (totalPages !== null && page < totalPages) {
      if (isChaptersMode) {
        prefetchNextPageChapters(queryClient, { ...queryKeyParams, slug: tenant! });
      } else {
        prefetchNextPageGamesLibrary(queryClient, { ...queryKeyParams, slug: tenant! });
      }
    }
  }, [page, totalPages, queryKeyParams, queryClient, isChaptersMode]);

  const changeSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    const apiValue = newSort === 'Recently Played' ? 'recent' : newSort === 'Game Name' ? 'game_name' : 'count';
    updateUrlParams({ sort: apiValue, page: '1' });
  };

  const handleClearSearch = () => {
    setInputSearch('');
    updateUrlParams({ search: null, page: '1' });
  };

  const heading = `${total} Games`;
  const emptyMessage = 'No games found';

  return (
    <div className="w-full py-1">
      <div className="mt-2 flex flex-col items-center justify-center">
        {total !== null && <h4 className="text-3xl font-medium text-[#6366f1] uppercase">{heading}</h4>}
      </div>
      <div className="flex flex-row flex-wrap items-center gap-2 pt-1">
        <div className="relative ml-1">
          <input
            type="text"
            placeholder="Search by Game"
            onChange={(e) => {
              setInputSearch(e.target.value);
              debouncedSetSearchTerm(e.target.value);
            }}
            value={inputSearch}
            className="h-9 w-44 rounded border border-[#222230] bg-[#16161e] px-3 pr-8 text-sm text-[#f0f0f5] placeholder-[#9ca3af]"
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
          className="ml-auto w-max rounded border border-[#222230] bg-[#16161e] px-3 py-1.5 text-sm text-[#f0f0f5]"
        >
          {SORTS.map((data) => (
            <option key={data} value={data}>
              {data}
            </option>
          ))}
        </select>
      </div>
      {isLoading && (
        <div className="mt-2 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="block w-full min-w-0 rounded">
              <div
                className="relative w-full overflow-hidden rounded-t bg-[#16161e]"
                style={{ aspectRatio: '400/530' }}
              >
                <div className="absolute inset-0 animate-pulse bg-[#222230]" />
              </div>
              <div className="w-full min-w-0 px-1 py-0.5 text-center">
                <span className="mx-auto block h-[16px] w-3/4 animate-pulse rounded bg-[#6366f1]/30" />
                <span className="mx-auto mt-0.5 block h-[16px] w-1/2 animate-pulse rounded bg-[#222230]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && items.length === 0 && <p className="mt-12 text-center text-sm text-[#9ca3af]">{emptyMessage}</p>}

      {!isLoading && items.length > 0 && (
        <div
          className={`mt-2 grid grid-cols-2 gap-6 transition-opacity duration-200 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 ${isBackgroundFetching ? 'pointer-events-none opacity-50' : 'opacity-100'}`}
        >
          {items.map((item: LibraryGameItem | LibraryChapterItem) => (
            <Card
              key={(item as LibraryGameItem).game_id || item.game_id}
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
          ))}
        </div>
      )}
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
                ...queryKeyParams,
                slug: tenant!,
                page: targetPage,
              })
            : prefetchNextPageGamesLibrary(queryClient, {
                ...queryKeyParams,
                slug: tenant!,
                page: targetPage,
              })
        }
      />
    </div>
  );
}
