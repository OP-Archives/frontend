import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, X } from 'lucide-react';
import { useEffect, useState, startTransition } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import VodCard from './VodCard';
import { useTenantContext } from '@/contexts/TenantContext';
import type { VodData } from '@/types';
import { useDebouncedSetter } from '@/utils/debounceHelper';
import { PaginationControls } from '@/utils/PaginationControls';
import { useGames } from '@/utils/useGames';
import { useMediaQuery } from '@/utils/useMediaQuery';
import { useVods, prefetchNextPageVods } from '@/utils/useVods';

const FILTERS = ['Default', 'Date', 'Title', 'Game'];
const PLATFORMS = ['All', 'Twitch', 'Kick'];

export function Vods() {
  const { tenant } = useParams<{ tenant: string }>() as { tenant: string };
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useMediaQuery('(max-width: 900px)');
  const todayString = new Date().toISOString().split('T')[0];

  const filter = searchParams.get('filter') || FILTERS[0];
  const filterStartDate = searchParams.get('from') || '';
  const filterEndDate = searchParams.get('to') || todayString;
  const filterTitle = searchParams.get('title') || '';
  const filterGame = searchParams.get('chapter') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const gameId = searchParams.get('game_id');
  const platform = searchParams.get('platform') || PLATFORMS[0];
  const limit = isMobile ? 10 : 20;

  const memoizedDateRange = (() => {
    if (filter !== 'Date' || !filterStartDate || !filterEndDate) return null;
    try {
      return {
        from: new Date(filterStartDate).toISOString(),
        to: new Date(filterEndDate).toISOString(),
      };
    } catch {
      return null;
    }
  })();

  const [inputTitle, setInputTitle] = useState(filterTitle);
  const [inputGame, setInputGame] = useState(filterGame);
  const [inputStartDate, setInputStartDate] = useState(filterStartDate);
  const [inputEndDate, setInputEndDate] = useState(filterEndDate);

  useEffect(() => {
    setInputTitle(filterTitle);
  }, [filterTitle]);
  useEffect(() => {
    setInputGame(filterGame);
  }, [filterGame]);
  useEffect(() => {
    setInputStartDate(filterStartDate);
  }, [filterStartDate]);
  useEffect(() => {
    setInputEndDate(filterEndDate);
  }, [filterEndDate]);

  const updateUrlParams = (updates: Record<string, string | null>) => {
    startTransition(() => {
      setSearchParams(
        (prev) => {
          const nextParams = new URLSearchParams(prev);
          for (const [key, val] of Object.entries(updates)) {
            if (val) nextParams.set(key, val);
            else nextParams.delete(key);
          }
          if (gameId) nextParams.set('game_id', gameId);
          return nextParams;
        },
        { replace: true }
      );
    });
  };

  const debouncedSetFilterTitle = useDebouncedSetter((val: string) => {
    updateUrlParams({ title: val, filter: 'Title', page: '1' });
  }, 500);

  const debouncedSetFilterGame = useDebouncedSetter((val: string) => {
    updateUrlParams({ chapter: val, filter: 'Game', page: '1' });
  }, 500);

  const debouncedSetStartDate = useDebouncedSetter((val: string) => {
    updateUrlParams({ from: val, page: '1' });
  }, 600);

  const debouncedSetEndDate = useDebouncedSetter((val: string) => {
    updateUrlParams({ to: val, page: '1' });
  }, 600);

  const queryKeyParams = {
    limit,
    page,
    sort: 'created_at',
    order: 'desc',
    ...(gameId ? { game_id: gameId } : {}),
    ...(platform !== PLATFORMS[0] ? { platform: platform.toLowerCase() } : {}),
    ...(memoizedDateRange ? memoizedDateRange : {}),
    ...(filter === 'Title' && filterTitle ? { title: filterTitle } : {}),
    ...(filter === 'Game' && filterGame ? { chapter: filterGame } : {}),
  };

  const { data, isLoading, isFetching } = useVods(tenant, queryKeyParams);
  const vods = data?.data ?? null;
  const totalVods = data?.meta?.total ?? null;
  const totalPages = Math.ceil((totalVods || 0) / limit);
  const isBackgroundFetching = isFetching && !isLoading;

  useEffect(() => {
    if (totalPages !== null && page < totalPages) {
      prefetchNextPageVods(queryClient, { ...queryKeyParams, slug: tenant });
    }
  }, [page, totalPages, queryKeyParams, queryClient]);

  const handleClearTitle = () => {
    setInputTitle('');
    updateUrlParams({ title: null, filter: 'Title', page: '1' });
  };

  const handleClearGame = () => {
    setInputGame('');
    updateUrlParams({ chapter: null, filter: 'Game', page: '1' });
  };

  const changeFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFilter = e.target.value;
    const updates: Record<string, string | null> = {
      page: '1',
      filter: newFilter === 'Default' ? null : newFilter,
    };
    if (newFilter !== 'Title') updates.title = null;
    if (newFilter !== 'Game') updates.chapter = null;
    if (newFilter !== 'Date') {
      updates.from = null;
      updates.to = null;
    }
    updateUrlParams(updates);
  };

  const changePlatform = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateUrlParams({
      platform: e.target.value === PLATFORMS[0] ? null : e.target.value,
      page: '1',
    });
  };

  useGames(tenant, { limit: 100, page: 1 });

  const { tenant: tenantCtx } = useTenantContext();
  const enabledPlatforms = tenantCtx?.platforms.filter((p) => p.enabled).length ?? 0;
  return (
    <div className="w-full">
      <div className="mt-2 flex flex-col items-center justify-center">
        {totalVods !== null && <h4 className="text-3xl font-medium text-[#6366f1] uppercase">{`${totalVods} Vods`}</h4>}
      </div>
      <div className="flex flex-row flex-wrap items-center gap-2 pt-1">
        {gameId && (
          <button
            onClick={() => navigate(-1)}
            className="mr-2 flex items-center gap-1 rounded border border-[#6366f1] bg-[#6366f1]/20 px-3 py-1.5 text-sm text-[#6366f1] transition-colors hover:bg-[#6366f1]/10"
          >
            <ArrowLeft size={16} /> Back
          </button>
        )}
        <select
          disabled={!!gameId}
          value={filter}
          onChange={changeFilter}
          className="mr-1 w-max rounded border border-[#222230] bg-[#16161e] px-3 py-1.5 text-sm text-[#f0f0f5]"
        >
          {FILTERS.map((data) => (
            <option key={data} value={data}>
              {data}
            </option>
          ))}
        </select>
        {filter === 'Date' && !gameId && (
          <div className="ml-1 flex items-center gap-1">
            <input
              type="date"
              min=""
              max={todayString}
              value={inputStartDate}
              onChange={(e) => {
                setInputStartDate(e.target.value);
                debouncedSetStartDate(e.target.value);
              }}
              className="rounded border border-[#222230] bg-[#16161e] px-2 py-1.5 text-sm text-[#f0f0f5]"
            />
            <input
              type="date"
              min=""
              max={todayString}
              value={inputEndDate}
              onChange={(e) => {
                setInputEndDate(e.target.value);
                debouncedSetEndDate(e.target.value);
              }}
              className="rounded border border-[#222230] bg-[#16161e] px-2 py-1.5 text-sm text-[#f0f0f5]"
            />
          </div>
        )}
        {filter === 'Title' && !gameId && (
          <div className="relative ml-1">
            <input
              type="text"
              placeholder="Search by Title"
              onChange={(e) => {
                setInputTitle(e.target.value);
                debouncedSetFilterTitle(e.target.value);
              }}
              value={inputTitle}
              className="w-44 rounded border border-[#222230] bg-[#16161e] px-3 py-1.5 pr-8 text-sm text-[#f0f0f5] placeholder-[#9ca3af]"
            />
            {inputTitle && (
              <button
                onClick={handleClearTitle}
                className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer text-[#9ca3af] transition-colors hover:text-[#f0f0f5]"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}
        {filter === 'Game' && !gameId && (
          <div className="relative ml-1">
            <input
              type="text"
              placeholder="Search by Game"
              onChange={(e) => {
                setInputGame(e.target.value);
                debouncedSetFilterGame(e.target.value);
              }}
              value={inputGame}
              className="w-44 rounded border border-[#222230] bg-[#16161e] px-2 py-1.5 pr-8 text-sm text-[#f0f0f5] placeholder-[#9ca3af]"
            />
            {inputGame && (
              <button
                onClick={handleClearGame}
                className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer text-[#9ca3af] transition-colors hover:text-[#f0f0f5]"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}
        {enabledPlatforms > 2 && (
          <select
            disabled={!!gameId}
            value={platform}
            onChange={changePlatform}
            className="ml-1 w-max rounded border border-[#222230] bg-[#16161e] px-3 py-1.5 text-sm text-[#f0f0f5]"
          >
            {PLATFORMS.map((data) => (
              <option key={data} value={data}>
                {data}
              </option>
            ))}
          </select>
        )}
      </div>
      {isLoading && (
        <div className="mx-auto mt-2 grid max-w-[1600px] grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="block w-full min-w-0">
              <div className="relative aspect-video w-full overflow-hidden bg-[#16161e]">
                <div className="absolute inset-0 animate-pulse bg-[#222230]" />
                <div className="absolute top-2 left-2">
                  <span className="inline-flex items-center gap-1 rounded bg-[#222230] px-2 py-0.5">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#9ca3af]" />
                  </span>
                </div>
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center justify-center rounded-md bg-[#222230] p-1">
                    <span className="h-5 w-5 animate-pulse" />
                  </span>
                </div>
                <div className="absolute bottom-0 left-0">
                  <span className="bg-[#222230] p-1.5 text-xs">
                    <span className="block h-[16px] w-[50px] animate-pulse rounded" />
                  </span>
                </div>
                <div className="absolute right-0 bottom-0">
                  <span className="bg-[#222230] p-1.5 text-xs">
                    <span className="block h-[16px] w-[30px] animate-pulse rounded" />
                  </span>
                </div>
              </div>
              <div className="mt-1 mb-1 flex items-center">
                <div className="shrink-0">
                  <div className="h-[53px] w-[40px] animate-pulse rounded-sm bg-[#222230]" />
                </div>
                <div className="min-w-0 flex-1 pl-2">
                  <div className="w-full min-w-0 p-0.5">
                    <span className="block animate-pulse truncate rounded bg-[#6366f1]/30 text-xs font-medium">
                      &nbsp;
                    </span>
                  </div>
                  <div className="mt-0.5 flex justify-center">
                    <span className="inline-flex animate-pulse cursor-pointer items-center gap-1 rounded border border-[#6366f1] px-3 py-1 font-semibold text-[#6366f1] transition-colors hover:bg-[#6366f1]/10">
                      <span className="block h-[16px] w-4 animate-pulse rounded bg-[#6366f1]/30" /> Watch
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && vods && vods.length === 0 && (
        <p className="mt-12 text-center text-sm text-[#9ca3af]">No VODs found matching your search filters.</p>
      )}

      {vods && vods.length > 0 && (
        <div
          className={`mx-auto mt-2 grid max-w-[1600px] grid-cols-2 gap-6 transition-opacity duration-200 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 ${isBackgroundFetching ? 'pointer-events-none opacity-50' : 'opacity-100'}`}
        >
          {vods.map((vod: VodData, index: number) => (
            <VodCard key={vod.id} vod={vod} priority={index < (isMobile ? 4 : 10)} />
          ))}
        </div>
      )}
      <div className="mt-6 mb-6">
        <PaginationControls
          page={page}
          totalPages={totalPages}
          preserveParams={{
            ...(gameId ? { game_id: gameId } : {}),
            ...(platform !== PLATFORMS[0] ? { platform } : {}),
            ...(filter === 'Date' && filterStartDate ? { from: filterStartDate } : {}),
            ...(filter === 'Date' && filterEndDate ? { to: filterEndDate } : {}),
            ...(filter === 'Title' && filterTitle ? { title: filterTitle } : {}),
            ...(filter === 'Game' && filterGame ? { chapter: filterGame } : {}),
          }}
          onHoverPage={(targetPage) =>
            prefetchNextPageVods(queryClient, { ...queryKeyParams, slug: tenant, page: targetPage })
          }
        />
      </div>
    </div>
  );
}
