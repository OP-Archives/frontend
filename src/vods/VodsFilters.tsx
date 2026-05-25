import { useEffect, useMemo, useState, startTransition } from 'react';
import { useSearchParams } from 'react-router-dom';
import FilterBar from '@/components/ui/FilterBar';
import { useTenantContext } from '@/contexts/TenantContext';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useMediaQuery('(max-width: 900px)');
  const todayString = new Date().toISOString().split('T')[0];

  const filter = searchParams.get('filter') || FILTERS[0];
  const filterStartDate = searchParams.get('from') || '';
  const filterEndDate = searchParams.get('to') || todayString;
  const filterTitle = searchParams.get('title') || '';
  const filterGame = searchParams.get('chapter') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const gameId = searchParams.get('game_id');
  const platform = searchParams.get('platform') || PLATFORMS[0];
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

  const [inputTitle, setInputTitle] = useState(filterTitle);
  const [inputGame, setInputGame] = useState(filterGame);
  const [inputStartDate, setInputStartDate] = useState(filterStartDate);
  const [inputEndDate, setInputEndDate] = useState(filterEndDate);

  useEffect(() => {
    setInputTitle(filterTitle);
  }, [filterTitle]);
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

  const queryKeyParams: VodsQueryParams = useMemo(
    () => ({
      limit,
      page,
      sort: 'created_at',
      order: 'desc',
      ...(gameId ? { game_id: gameId } : {}),
      ...(platform !== PLATFORMS[0] ? { platform: platform.toLowerCase() } : {}),
      ...(memoizedDateRange ? memoizedDateRange : {}),
      ...(filter === 'Title' && filterTitle ? { title: filterTitle } : {}),
      ...(filter === 'Game' && filterGame ? { chapter: filterGame } : {}),
    }),
    [limit, page, gameId, platform, memoizedDateRange, filter, filterTitle, filterGame]
  );

  const handleClearTitle = () => {
    setInputTitle('');
    updateUrlParams({ title: null, filter: 'Title', page: '1' });
  };

  const handleClearGame = () => {
    setInputGame('');
    updateUrlParams({ chapter: null, filter: 'Game', page: '1' });
  };

  const changeFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFilter = e.target.value;
    const updates: Record<string, string | null> = {
      page: '1',
      filter: newFilter === 'Default' ? null : newFilter,
    };
    if (newFilter !== 'Title') updates.title = null;
    if (newFilter !== 'Game') updates.chapter = null;
    if (newFilter !== 'Date') {
      updates.from = null;
      updates.to = null;
    }
    updateUrlParams(updates);
  };

  const changePlatform = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateUrlParams({
      platform: e.target.value === PLATFORMS[0] ? null : e.target.value,
      page: '1',
    });
  };

  const { tenant: tenantCtx } = useTenantContext();
  const enabledPlatforms = tenantCtx?.platforms.filter((p) => p.enabled).length ?? 0;

  const state: VodsFiltersState = {
    filter,
    filterStartDate,
    filterEndDate,
    filterTitle,
    filterGame,
    page,
    gameId,
    platform,
    limit,
    inputTitle,
    inputGame,
    inputStartDate,
    inputEndDate,
  };

  return {
    tenant,
    state,
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
