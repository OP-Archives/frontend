import { useEffect, useMemo, useState } from 'react';
import FilterBar from '@/components/ui/FilterBar';
import { useDebouncedSetter } from '@/hooks/debounceHelper';
import type { GamesQueryParams } from '@/hooks/useGames';
import { useListFilters } from '@/hooks/useListFilters';
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
  const {
    state,
    updateParams,
    changeFilter,
    queryKeyParams: baseParams,
  } = useListFilters({
    filterOptions: FILTERS,
    searchParamKey: { search: 'game', from: 'from', to: 'to' },
    defaultFilter: 'Default',
  });

  const [inputGame, setInputGame] = useState(state.inputSearch);

  useEffect(() => {
    setInputGame(state.inputSearch);
  }, [state.inputSearch]);

  const debouncedSetGame = useDebouncedSetter((val: string) => {
    updateUrlParams({ game: val, filter: 'Game', page: '1' });
  }, 500);

  const filterGame = inputGame;

  const queryKeyParams: GamesQueryParams = useMemo(
    () => ({
      ...baseParams,
      sort: 'created_at' as const,
      order: 'desc' as const,
      ...(state.filter === 'Game' && filterGame ? { game_name: filterGame } : {}),
    }),
    [baseParams, state.filter, filterGame]
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
    setInputGame,
    debouncedSetGame,
    handleClearGame: () => {
      setInputGame('');
      updateUrlParams({ game: null, filter: 'Game', page: '1' });
    },
  };
}

interface GamesFiltersBarProps {
  state: GamesFiltersState;
  changeFilter: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleClearGame: () => void;
  updateUrlParams: (updates: Record<string, string | null>) => void;
  setInputGame: (val: string) => void;
  debouncedSetGame: (val: string) => void;
}

export function GamesFiltersBar({
  state,
  changeFilter,
  handleClearGame,
  updateUrlParams,
  setInputGame,
  debouncedSetGame,
}: GamesFiltersBarProps) {
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
      onSearchChange={setInputGame}
      debouncedOnSearchChange={debouncedSetGame}
      onSearchClear={handleClearGame}
      dateStartValue={inputStartDate}
      dateEndValue={inputEndDate}
      onDateStartChange={(val) => updateUrlParams({ from: val, page: '1' })}
      onDateEndChange={(val) => updateUrlParams({ to: val, page: '1' })}
      maxDate={new Date().toISOString().split('T')[0]}
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
