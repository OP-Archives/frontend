import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
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
    tenantCtx,
    handleClearTitle,
    handleClearGame,
    changeFilter,
    changePlatform,
    updateUrlParams,
    setInputGame,
    setInputTitle,
    debouncedSetTitle,
    debouncedSetGame,
  } = useVodsFilters();
  const queryClient = useQueryClient();

  const { data, isLoading } = useVods(tenant, queryKeyParams);
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
      <Helmet>
        <title>{`${tenantCtx?.display_name || tenant} VODs - op archive`}</title>
        <meta
          name="description"
          content={`Browse all archived Twitch and Kick VODs for ${tenantCtx?.display_name || tenant}. Filter by game, date, and title.`}
        />
      </Helmet>

      <div className="mt-2 flex flex-col items-center justify-center">
        <div className="rounded-lg border border-[#222230] bg-[#16161e]/80 px-6 py-3">
          <h4 className="text-3xl font-medium text-[#6366f1] uppercase">
            {totalVods !== null ? `${totalVods} VODS ARCHIVED` : 'VODS ARCHIVED'}
          </h4>
        </div>
      </div>
      <VodsFiltersBar
        state={state}
        changeFilter={changeFilter}
        changePlatform={changePlatform}
        handleClearTitle={handleClearTitle}
        handleClearGame={handleClearGame}
        enabledPlatforms={enabledPlatforms}
        tenantCtx={tenantCtx}
        updateUrlParams={updateUrlParams}
        setInputGame={setInputGame}
        setInputTitle={setInputTitle}
        debouncedSetTitle={debouncedSetTitle}
        debouncedSetGame={debouncedSetGame}
      />
      <VodsGrid vods={vods} isLoading={isLoading} limit={state.limit} />
      <div className="mt-6">
        <PaginationControls
          page={state.page}
          totalPages={totalPages}
          preserveParams={{
            ...(state.filter ? { filter: state.filter } : {}),
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
