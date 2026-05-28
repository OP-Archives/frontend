import { useEffect, useMemo, useState } from 'react';
import FilterBar from '@/components/ui/FilterBar';
import { useTenantContext } from '@/contexts/TenantContext';
import { useDebouncedSetter } from '@/hooks/debounceHelper';
import { useListFilters } from '@/hooks/useListFilters';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useTypedParams } from '@/hooks/useTypedParams';
import type { VodsQueryParams } from '@/hooks/useVods';
import type { Tenant } from '@/types';

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

  const [platformState, setPlatformState] = useState(PLATFORMS[0]);
  const [inputGame, setInputGame] = useState(() => {
    const chapter = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('chapter') : null;
    return chapter || '';
  });
  const [inputTitle, setInputTitle] = useState(state.inputSearch);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setInputGame(searchParams.get('chapter') || '');
  }, []);

  useEffect(() => {
    setInputTitle(state.inputSearch);
  }, [state.inputSearch]);

  const debouncedSetTitle = useDebouncedSetter((val: string) => {
    updateUrlParams({ title: val, filter: 'Title', page: '1' });
  }, 500);

  const debouncedSetGame = useDebouncedSetter((val: string) => {
    updateUrlParams({ chapter: val, filter: 'Game', page: '1' });
  }, 500);

  const filterTitle = inputTitle;
  const filterGame = inputGame;

  const queryKeyParams: VodsQueryParams = useMemo(
    () => ({
      ...baseParams,
      sort: 'created_at',
      order: 'desc',
      ...(platformState !== PLATFORMS[0] ? { platform: platformState.toLowerCase() } : {}),
      ...(state.filter === 'Title' && filterTitle ? { title: filterTitle } : {}),
      ...(state.filter === 'Game' && filterGame ? { chapter: filterGame } : {}),
    }),
    [baseParams, platformState, state.filter, filterTitle, filterGame]
  );

  const updateUrlParams = (updates: Record<string, string | null>) => {
    updateParams(updates);
  };

  const handleClearTitle = () => {
    setInputTitle('');
    handleClearSearch();
    updateUrlParams({ title: null, filter: 'Title', page: '1' });
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
    filterGame,
    platform: platformState,
    inputTitle: filterTitle,
    inputGame: filterGame,
  };

  return {
    tenant,
    state: vodsState,
    updateUrlParams,
    changeFilter,
    changePlatform,
    queryKeyParams,
    enabledPlatforms,
    tenantCtx,
    setInputGame,
    setInputTitle,
    debouncedSetTitle,
    debouncedSetGame,
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
  tenantCtx: Tenant | null;
  updateUrlParams: (updates: Record<string, string | null>) => void;
  setInputGame: (val: string) => void;
  setInputTitle: (val: string) => void;
  debouncedSetTitle: (val: string) => void;
  debouncedSetGame: (val: string) => void;
}

export function VodsFiltersBar({
  state,
  changeFilter,
  changePlatform,
  handleClearTitle,
  handleClearGame,
  enabledPlatforms,
  tenantCtx,
  updateUrlParams,
  setInputGame,
  setInputTitle,
  debouncedSetTitle,
  debouncedSetGame,
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
          setInputTitle(val);
        } else {
          setInputGame(val);
        }
      }}
      debouncedOnSearchChange={(val) => {
        if (filter === 'Title') {
          debouncedSetTitle(val);
        } else {
          debouncedSetGame(val);
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
      maxDate={new Date().toISOString().split('T')[0]}
      minDate={tenantCtx?.created_at?.split('T')[0]}
      showDateRange={filter === 'Date'}
      showSearch={filter === 'Title' || filter === 'Game'}
      searchPlaceholder={filter === 'Game' ? 'Search by Game' : 'Search by Title'}
      disabled={!!gameId}
      gameId={gameId}
      onBack={() => window.history.back()}
      hasBackButton={!!gameId}
      extraControls={
        enabledPlatforms > 1 && (
          <select
            disabled={!!gameId}
            value={state.platform}
            onChange={changePlatform}
            className="border-border bg-bg-surface text-text-primary hover:border-border/80 focus:border-primary focus:ring-primary/30 ml-1 h-9 w-max rounded-md border px-3 text-sm transition-all duration-200 focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
