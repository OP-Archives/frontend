import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useVodsFilters, VodsFiltersBar } from './VodsFilters';
import { VodsGrid } from './VodsGrid';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { useVods, prefetchNextPageVods } from '@/hooks/useVods';

export function Vods() {
  const {
    tenant,
    state,
    queryKeyParams,
    enabledPlatforms,
    handleClearTitle,
    handleClearGame,
    changeFilter,
    changePlatform,
    updateUrlParams,
  } = useVodsFilters();
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching } = useVods(tenant, queryKeyParams);
  const vods = data?.data ?? null;
  const totalVods = data?.meta?.total ?? null;
  const totalPages = Math.ceil((totalVods || 0) / state.limit);

  useEffect(() => {
    if (totalPages !== null && state.page < totalPages) {
      prefetchNextPageVods(queryClient, { ...queryKeyParams, slug: tenant });
    }
  }, [state.page, totalPages, queryKeyParams, queryClient]);

  return (
    <div className="w-full">
      <div className="mt-2 flex flex-col items-center justify-center">
        {totalVods !== null && (
          <h4 className="text-3xl font-medium text-[#6366f1] uppercase">{`${totalVods} VODS ARCHIVED`}</h4>
        )}
      </div>
      <VodsFiltersBar
        state={state}
        changeFilter={changeFilter}
        changePlatform={changePlatform}
        handleClearTitle={handleClearTitle}
        handleClearGame={handleClearGame}
        enabledPlatforms={enabledPlatforms}
        updateUrlParams={updateUrlParams}
      />
      <VodsGrid vods={vods} isLoading={isLoading} isFetching={isFetching} limit={state.limit} />
      <div className="mt-6 mb-6">
        <PaginationControls
          page={state.page}
          totalPages={totalPages}
          preserveParams={{
            ...(state.gameId ? { game_id: state.gameId } : {}),
            ...(state.platform !== 'All' ? { platform: state.platform } : {}),
            ...(state.filter === 'Date' && state.filterStartDate ? { from: state.filterStartDate } : {}),
            ...(state.filter === 'Date' && state.filterEndDate ? { to: state.filterEndDate } : {}),
            ...(state.filter === 'Title' && state.filterTitle ? { title: state.filterTitle } : {}),
            ...(state.filter === 'Game' && state.filterGame ? { chapter: state.filterGame } : {}),
          }}
          onHoverPage={(targetPage) =>
            prefetchNextPageVods(queryClient, { ...queryKeyParams, slug: tenant, page: targetPage })
          }
        />
      </div>
    </div>
  );
}
