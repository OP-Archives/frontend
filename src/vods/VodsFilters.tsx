import { useMemo, useState } from 'react';
import FilterBar from '@/components/ui/FilterBar';
import { useTenantContext } from '@/contexts/TenantContext';
import { useListFilters } from '@/hooks/useListFilters';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useTypedParams } from '@/hooks/useTypedParams';
import type { VodsQueryParams } from '@/hooks/useVods';

const FILTERS = ['Default', 'Date', 'Title', 'Game'];
const PLATFORMS = ['All', 'Twitch', 'Kick'];

export interface VodsFiltersState {
  filter: string;
  filterStartDate: string;
  filterEndDate: string;
  filterTitle: string;
  filterGame: string;
  page: number;
  gameId: string | null;
  platform: string;
  limit: number;
  inputTitle: string;
  inputGame: string;
  inputStartDate: string;
  inputEndDate: string;
}

export function useVodsFilters() {
  const { tenant } = useTypedParams<{ tenant: string }>();
  const isMobile = useMediaQuery('(max-width: 900px)');

  const {
    state,
    updateParams,
    changeFilter,
    handleClearSearch,
    queryKeyParams: baseParams,
  } = useListFilters({
    filterOptions: FILTERS,
    searchParamKey: { search: 'title', from: 'from', to: 'to' },
    defaultFilter: 'Default',
    isMobile: isMobile,
  });

  const [inputGame, setInputGame] = useState(state.inputSearch);
  const [platformState, setPlatformState] = useState(PLATFORMS[0]);

  const filterTitle = state.inputSearch;

  const queryKeyParams: VodsQueryParams = useMemo(
    () => ({
      limit: baseParams.limit ?? 20,
      page: baseParams.page ?? 1,
      sort: 'created_at',
      order: 'desc',
      ...(platformState !== PLATFORMS[0] ? { platform: platformState.toLowerCase() } : {}),
      ...(state.filter === 'Title' && filterTitle ? { title: filterTitle } : {}),
      ...(state.filter === 'Game' && inputGame ? { chapter: inputGame } : {}),
    }),
    [baseParams.limit, baseParams.page, platformState, state.filter, filterTitle, inputGame]
  );

  const updateUrlParams = (updates: Record<string, string | null>) => {
    updateParams(updates);
  };

  const handleClearTitle = () => {
    handleClearSearch();
  };

  const handleClearGame = () => {
    setInputGame('');
    updateUrlParams({ chapter: null, filter: 'Game', page: '1' });
  };

  const changePlatform = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPlatformState(e.target.value);
    updateUrlParams({
      platform: e.target.value === PLATFORMS[0] ? null : e.target.value,
      page: '1',
    });
  };

  const { tenant: tenantCtx } = useTenantContext();
  const enabledPlatforms = tenantCtx?.platforms.filter((p) => p.enabled).length ?? 0;

  const vodsState: VodsFiltersState = {
    ...state,
    filterTitle,
    filterGame: inputGame,
    platform: platformState,
    inputTitle: filterTitle,
    inputGame,
  };

  return {
    tenant,
    state: vodsState,
    updateUrlParams,
    changeFilter,
    changePlatform,
    queryKeyParams,
    enabledPlatforms,
    handleClearTitle,
    handleClearGame,
  };
}

interface VodsFiltersBarProps {
  state: VodsFiltersState;
  changeFilter: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  changePlatform: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleClearTitle: () => void;
  handleClearGame: () => void;
  enabledPlatforms: number;
  updateUrlParams: (updates: Record<string, string | null>) => void;
}

export function VodsFiltersBar({
  state,
  changeFilter,
  changePlatform,
  handleClearTitle,
  handleClearGame,
  enabledPlatforms,
  updateUrlParams,
}: VodsFiltersBarProps) {
  const { filter, inputTitle, inputGame, inputStartDate, inputEndDate, gameId } = state;

  return (
    <FilterBar
      mode="vods"
      filterValue={filter}
      onFilterChange={(val) => {
        const e = { target: { value: val } } as React.ChangeEvent<HTMLSelectElement>;
        changeFilter(e);
      }}
      searchValue={filter === 'Title' ? inputTitle : inputGame}
      onSearchChange={(val) => {
        if (filter === 'Title') {
          updateUrlParams({ title: val, filter: 'Title', page: '1' });
        } else {
          updateUrlParams({ chapter: val, filter: 'Game', page: '1' });
        }
      }}
      onSearchClear={() => {
        if (filter === 'Title') handleClearTitle();
        else handleClearGame();
      }}
      dateStartValue={inputStartDate}
      dateEndValue={inputEndDate}
      onDateStartChange={(val) => updateUrlParams({ from: val, page: '1' })}
      onDateEndChange={(val) => updateUrlParams({ to: val, page: '1' })}
      showDateRange={filter === 'Date'}
      showSearch={filter === 'Title' || filter === 'Game'}
      disabled={!!gameId}
      gameId={gameId}
      onBack={() => window.history.back()}
      hasBackButton={!!gameId}
      extraControls={
        enabledPlatforms > 2 && (
          <select
            disabled={!!gameId}
            value={state.platform}
            onChange={changePlatform}
            className="ml-1 w-max rounded border border-[#222230] bg-[#16161e] px-3 py-1.5 text-sm text-[#f0f0f5]"
          >
            {PLATFORMS.map((data) => (
              <option key={data} value={data}>
                {data}
              </option>
            ))}
          </select>
        )
      }
      filterOptions={FILTERS}
    />
  );
}
