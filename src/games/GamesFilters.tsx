import { useEffect, useMemo, useState, startTransition } from 'react';
import { useSearchParams } from 'react-router-dom';
import FilterBar from '@/components/ui/FilterBar';
import type { GamesQueryParams } from '@/hooks/useGames';
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

  const queryKeyParams: GamesQueryParams = useMemo(
    () => ({
      limit,
      page,
      sort: 'created_at',
      order: 'desc',
      ...(gameId ? { game_id: gameId } : {}),
      ...(memoizedDateRange ? memoizedDateRange : {}),
      ...(filter === 'Game' && filterGame ? { game_name: filterGame } : {}),
    }),
    [limit, page, gameId, memoizedDateRange, filter, filterGame]
  );

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

  const state: GamesFiltersState = {
    filter,
    filterStartDate,
    filterEndDate,
    filterGame,
    page,
    gameId,
    limit,
    inputGame,
    inputStartDate,
    inputEndDate,
  };

  return {
    tenant,
    state,
    updateUrlParams,
    changeFilter,
    queryKeyParams,
    handleClearGame,
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
