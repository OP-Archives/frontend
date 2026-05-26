import { useMemo } from 'react';
import FilterBar from '@/components/ui/FilterBar';
import type { GamesQueryParams } from '@/hooks/useGames';
import { useListFilters } from '@/hooks/useListFilters';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useTypedParams } from '@/hooks/useTypedParams';

const FILTERS = ['Default', 'Date', 'Game'];

export interface GamesFiltersState {
  filter: string;
  filterStartDate: string;
  filterEndDate: string;
  filterGame: string;
  page: number;
  gameId: string | null;
  limit: number;
  inputGame: string;
  inputStartDate: string;
  inputEndDate: string;
}

export function useGamesFilters() {
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
    searchParamKey: { search: 'game', from: 'from', to: 'to' },
    defaultFilter: 'Default',
    isMobile,
  });

  const filterGame = state.inputSearch;

  const queryKeyParams: GamesQueryParams = useMemo(
    () => ({
      limit: baseParams.limit ?? 20,
      page: baseParams.page ?? 1,
      sort: 'created_at' as const,
      order: 'desc' as const,
      ...(state.filter === 'Game' && filterGame ? { game_name: filterGame } : {}),
    }),
    [baseParams.limit, baseParams.page, state.filter, filterGame]
  );

  const updateUrlParams = (updates: Record<string, string | null>) => {
    updateParams(updates);
  };

  const gamesState: GamesFiltersState = {
    ...state,
    filterGame,
    inputGame: filterGame,
  };

  return {
    tenant,
    state: gamesState,
    updateUrlParams,
    changeFilter,
    queryKeyParams,
    handleClearGame: handleClearSearch,
  };
}

interface GamesFiltersBarProps {
  state: GamesFiltersState;
  changeFilter: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleClearGame: () => void;
  updateUrlParams: (updates: Record<string, string | null>) => void;
}

export function GamesFiltersBar({ state, changeFilter, handleClearGame, updateUrlParams }: GamesFiltersBarProps) {
  const { filter, inputGame, inputStartDate, inputEndDate, gameId } = state;

  return (
    <FilterBar
      mode="games"
      filterValue={filter}
      onFilterChange={(val) => {
        const e = { target: { value: val } } as React.ChangeEvent<HTMLSelectElement>;
        changeFilter(e);
      }}
      searchValue={inputGame}
      onSearchChange={(val) => {
        updateUrlParams({ game: val, filter: 'Game', page: '1' });
      }}
      onSearchClear={handleClearGame}
      dateStartValue={inputStartDate}
      dateEndValue={inputEndDate}
      onDateStartChange={(val) => updateUrlParams({ from: val, page: '1' })}
      onDateEndChange={(val) => updateUrlParams({ to: val, page: '1' })}
      showDateRange={filter === 'Date'}
      showSearch={filter === 'Game'}
      disabled={!!gameId}
      gameId={gameId}
      onBack={() => window.history.back()}
      hasBackButton={!!gameId}
      filterOptions={FILTERS}
    />
  );
}
