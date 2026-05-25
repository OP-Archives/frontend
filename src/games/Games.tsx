import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, X } from 'lucide-react';
import { useEffect, useState, startTransition } from 'react';
import { Link, useSearchParams, useParams } from 'react-router-dom';
import CustomWidthTooltip from '@/components/ui/CustomToolTip';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { useGames, prefetchNextPageGames } from '@/hooks/useGames';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import type { GameData } from '@/types';
import { toHHMMSS, getImage } from '@/utils/helpers';

const FILTERS = ['Default', 'Date', 'Game'];

export function Games() {
  const { tenant } = useParams<{ tenant: string }>() as { tenant: string };
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useMediaQuery('(max-width: 900px)');
  const todayString = new Date().toISOString().split('T')[0];

  const filter = searchParams.get('filter') || FILTERS[0];
  const filterStartDate = searchParams.get('from') || '';
  const filterEndDate = searchParams.get('to') || todayString;
  const filterGame = searchParams.get('game') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const gameId = searchParams.get('game_id');
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

  const [inputGame, setInputGame] = useState(filterGame);
  const [inputStartDate, setInputStartDate] = useState(filterStartDate);
  const [inputEndDate, setInputEndDate] = useState(filterEndDate);

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

  const queryKeyParams = {
    limit,
    page,
    sort: 'created_at',
    order: 'desc',
    ...(gameId ? { game_id: gameId } : {}),
    ...(memoizedDateRange ? memoizedDateRange : {}),
    ...(filter === 'Game' && filterGame ? { game_name: filterGame } : {}),
  };

  const { data, isLoading, isFetching } = useGames(tenant, queryKeyParams);
  const games = data?.data ?? null;
  const totalGames = data?.meta?.total ?? null;
  const totalPages = Math.ceil((totalGames || 0) / limit);
  const isBackgroundFetching = isFetching && !isLoading;

  useEffect(() => {
    if (totalPages !== null && page < totalPages) {
      prefetchNextPageGames(queryClient, { ...queryKeyParams, slug: tenant });
    }
  }, [page, totalPages, queryKeyParams, queryClient]);

  const handleClearGame = () => {
    setInputGame('');
    updateUrlParams({ game: null, filter: 'Default', page: '1' });
  };

  const changeFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFilter = e.target.value;
    const updates: Record<string, string | null> = {
      page: '1',
      filter: newFilter === 'Default' ? null : newFilter,
    };
    if (newFilter !== 'Game') updates.game = null;
    if (newFilter !== 'Date') {
      updates.from = null;
      updates.to = null;
    }
    updateUrlParams(updates);
  };

  return (
    <div className="w-full">
      <div className="mt-2 flex flex-col items-center justify-center">
        {totalGames !== null && (
          <h4 className="text-3xl font-medium text-[#6366f1] uppercase">{`${totalGames} Games`}</h4>
        )}
      </div>
      <div className="flex flex-row flex-wrap items-center gap-2 pt-1">
        {gameId && (
          <button
            onClick={() => window.history.back()}
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
                updateUrlParams({ from: e.target.value, page: '1' });
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
                updateUrlParams({ to: e.target.value, page: '1' });
              }}
              className="rounded border border-[#222230] bg-[#16161e] px-2 py-1.5 text-sm text-[#f0f0f5]"
            />
          </div>
        )}
        {filter === 'Game' && !gameId && (
          <div className="relative ml-1">
            <input
              type="text"
              placeholder="Search by Game"
              onChange={(e) => {
                setInputGame(e.target.value);
                updateUrlParams({ game: e.target.value, filter: 'Game', page: '1' });
              }}
              value={inputGame}
              className="w-44 rounded border border-[#222230] bg-[#16161e] px-3 py-1.5 pr-8 text-sm text-[#f0f0f5] placeholder-[#9ca3af]"
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
      </div>
      {isLoading && (
        <div className="mt-2 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="block w-full min-w-0">
              <div className="relative aspect-video w-full overflow-hidden bg-[#222230]">
                <div className="absolute inset-0 animate-pulse bg-[#16161e]" />
                <div className="absolute bottom-0 left-0">
                  <span className="animate-pulse rounded bg-[#222230] p-1.5">
                    <span className="block h-[16px] w-[50px]" />
                  </span>
                </div>
                <div className="absolute right-0 bottom-0">
                  <span className="animate-pulse rounded bg-[#222230] p-1.5">
                    <span className="block h-[16px] w-[30px]" />
                  </span>
                </div>
              </div>
              <div className="mt-1 mb-1 flex cursor-default items-start">
                <div className="h-[53px] w-[40px] shrink-0 animate-pulse rounded bg-[#222230]" />
                <div className="mt-2 min-w-0 flex-1 pl-2">
                  <div className="w-full min-w-0 p-0.5">
                    <span className="block h-[16px] w-3/4 animate-pulse rounded bg-[#6366f1]/30" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && games && games.length === 0 && (
        <p className="mt-12 text-center text-sm text-[#9ca3af]">No games found matching your search filters.</p>
      )}

      {!isLoading && games && games.length > 0 && (
        <div
          className={`mt-2 grid grid-cols-2 gap-6 transition-opacity duration-200 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 ${isBackgroundFetching ? 'pointer-events-none opacity-50' : 'opacity-100'}`}
        >
          {games.map((game: GameData) => (
            <div key={game.id} className="block w-full min-w-0 cursor-pointer">
              <div className="group relative aspect-video w-full rounded-md bg-[#6366f1] transition-shadow duration-200 group-hover:shadow-[0_8px_20px_rgba(99,102,241,0.25)]">
                <div className="absolute inset-0 overflow-hidden rounded-md bg-[#222230] transition-all duration-200 ease-out group-hover:-translate-x-1.5 group-hover:-translate-y-1.5 group-hover:shadow-[8px_8px_24px_rgba(0,0,0,0.6)]">
                  <a href={`/${tenant}/games/${game.vod_id}?game_id=${game.id}`}>
                    {game.thumbnail_url ? (
                      <img className="thumbnail h-full w-full object-cover" alt="" src={game.thumbnail_url} />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-sm text-[#9ca3af]">?</div>
                    )}
                  </a>
                  <div className="shadow-glow pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute bottom-0 left-0">
                      <span className="bg-black/60 p-1.5 text-xs text-white">
                        {new Intl.DateTimeFormat('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }).format(new Date(game.created_at))}
                      </span>
                    </div>
                  </div>
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute right-0 bottom-0">
                      <span className="bg-black/60 p-1.5 text-xs text-white">{toHHMMSS(game.duration)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-1 mb-1 flex cursor-default items-start">
                {game.chapter_image && (
                  <div className="mr-2 shrink-0">
                    <img
                      alt=""
                      src={getImage(game.chapter_image, 40, 53)}
                      width={40}
                      height={53}
                      className="pointer-events-none h-[53px] w-[40px] shrink-0 object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/${tenant}/games/${game.vod_id}?game_id=${game.id}`}
                    className="inline-flex max-w-full min-w-0 no-underline"
                  >
                    <CustomWidthTooltip title={game.title}>
                      <span className="truncate text-xs font-medium text-[#6366f1] hover:text-[#6366f1]/80">
                        {game.title}
                      </span>
                    </CustomWidthTooltip>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <PaginationControls
        page={page}
        totalPages={totalPages}
        preserveParams={{
          ...(gameId ? { game_id: gameId } : {}),
          ...(filter === 'Date' && filterStartDate ? { from: filterStartDate } : {}),
          ...(filter === 'Date' && filterEndDate ? { to: filterEndDate } : {}),
          ...(filter === 'Game' && filterGame ? { game: filterGame } : {}),
        }}
        onHoverPage={(targetPage) =>
          prefetchNextPageGames(queryClient, {
            ...queryKeyParams,
            slug: tenant,
            page: targetPage,
          })
        }
      />
    </div>
  );
}
