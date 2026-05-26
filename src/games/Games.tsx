import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useGamesFilters, GamesFiltersBar } from './GamesFilters';
import { GamesGrid } from './GamesGrid';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { useGames, prefetchNextPageGames } from '@/hooks/useGames';

export function Games() {
  const { tenant, state, queryKeyParams, handleClearGame, changeFilter, updateUrlParams } = useGamesFilters();
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching } = useGames(tenant, queryKeyParams);
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
      <div className="mt-2 flex flex-col items-center justify-center">
        {totalGames !== null && (
          <h4 className="text-3xl font-medium text-[#6366f1] uppercase">{`${totalGames} GAMES ARCHIVED`}</h4>
        )}
      </div>
      <GamesFiltersBar
        state={state}
        changeFilter={changeFilter}
        handleClearGame={handleClearGame}
        updateUrlParams={updateUrlParams}
      />
      <GamesGrid games={games} isLoading={isLoading} isFetching={isFetching} tenant={tenant} limit={state.limit} />
      <PaginationControls
        page={state.page}
        totalPages={totalPages}
        preserveParams={{
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
  );
}
