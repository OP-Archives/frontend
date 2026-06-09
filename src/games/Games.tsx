import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useGamesFilters, GamesFiltersBar } from './GamesFilters';
import { GamesGrid } from './GamesGrid';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { useTenantContext } from '@/contexts/TenantContext';
import { useGames, prefetchNextPageGames } from '@/hooks/useGames';

export function Games() {
  const {
    tenant,
    state,
    queryKeyParams,
    handleClearGame,
    changeFilter,
    updateUrlParams,
    setInputGame,
    debouncedSetGame,
  } = useGamesFilters();
  const queryClient = useQueryClient();
  const tenantCtx = useTenantContext();

  const { data, isLoading } = useGames(tenant, queryKeyParams);
  const games = data?.data ?? null;
  const totalGames = data?.meta?.total ?? null;
  const totalPages = Math.ceil((totalGames || 0) / state.limit);

  useEffect(() => {
    if (totalPages !== null && state.page < totalPages) {
      prefetchNextPageGames(queryClient, { ...queryKeyParams, slug: tenant });
    }
  }, [state.page, totalPages, queryKeyParams, queryClient]);

  return (
    <div className="w-full">
      <Helmet>
        <title>{`${tenantCtx.tenant?.display_name || tenant} Games - op archive`}</title>
        <meta
          name="description"
          content={`Browse all games and chapters played by ${tenantCtx.tenant?.display_name || tenant} on Twitch and Kick. Filter by game, date, and chapter.`}
        />
      </Helmet>

      <div className="mt-2 flex flex-col items-center justify-center">
        <div className="rounded-lg border border-[#222230] bg-[#16161e]/80 px-6 py-3">
          <h4 className="text-3xl font-medium text-[#6366f1] uppercase">
            {totalGames !== null ? `${totalGames} GAMES ARCHIVED` : 'GAMES ARCHIVED'}
          </h4>
        </div>
      </div>
      <GamesFiltersBar
        state={state}
        changeFilter={changeFilter}
        handleClearGame={handleClearGame}
        updateUrlParams={updateUrlParams}
        setInputGame={setInputGame}
        debouncedSetGame={debouncedSetGame}
      />
      <GamesGrid games={games} isLoading={isLoading} tenant={tenant} limit={state.limit} />
      <div className="mt-6">
        <PaginationControls
          page={state.page}
          totalPages={totalPages}
          preserveParams={{
            ...(state.filter ? { filter: state.filter } : {}),
            ...(state.gameId ? { game_id: state.gameId } : {}),
            ...(state.filter === 'Date' && state.filterStartDate ? { from: state.filterStartDate } : {}),
            ...(state.filter === 'Date' && state.filterEndDate ? { to: state.filterEndDate } : {}),
            ...(state.filter === 'Game' && state.filterGame ? { game: state.filterGame } : {}),
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
    </div>
  );
}
