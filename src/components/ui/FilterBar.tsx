import { ArrowLeft, X } from 'lucide-react';
import { type ReactNode } from 'react';

interface FilterBarProps {
  mode: 'vods' | 'games' | 'library';
  filterValue: string;
  onFilterChange: (value: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
  dateStartValue?: string;
  dateEndValue?: string;
  onDateStartChange?: (value: string) => void;
  onDateEndChange?: (value: string) => void;
  showDateRange?: boolean;
  showSearch?: boolean;
  disabled?: boolean;
  gameId?: string | null;
  onBack?: () => void;
  hasBackButton?: boolean;
  extraControls?: ReactNode;
  filterOptions?: string[];
  showFilter?: boolean;
}

export default function FilterBar({
  mode,
  filterValue,
  onFilterChange,
  searchValue,
  onSearchChange,
  onSearchClear,
  dateStartValue,
  dateEndValue,
  onDateStartChange,
  onDateEndChange,
  showDateRange,
  showSearch,
  disabled,
  gameId,
  onBack,
  hasBackButton,
  extraControls,
  filterOptions = ['Default', 'Date', 'Game'],
  showFilter = mode !== 'library',
}: FilterBarProps) {
  const todayString = new Date().toISOString().split('T')[0];

  return (
    <div className="flex flex-row flex-wrap items-center gap-2 pt-1">
      {hasBackButton && (
        <button
          onClick={onBack}
          className="mr-2 flex items-center gap-1 rounded border border-[#6366f1] bg-[#6366f1]/20 px-3 py-1.5 text-sm text-[#6366f1] transition-colors hover:bg-[#6366f1]/10"
        >
          <ArrowLeft size={16} /> Back
        </button>
      )}
      {showFilter && (
        <select
          disabled={disabled || !!gameId}
          value={filterValue}
          onChange={(e) => onFilterChange(e.target.value)}
          className="mr-1 w-max rounded border border-[#222230] bg-[#16161e] px-3 py-1.5 text-sm text-[#f0f0f5]"
        >
          {filterOptions.map((data) => (
            <option key={data} value={data}>
              {data}
            </option>
          ))}
        </select>
      )}
      {showDateRange &&
        onDateStartChange &&
        onDateEndChange &&
        dateStartValue !== undefined &&
        dateEndValue !== undefined &&
        !gameId && (
          <div className="ml-1 flex items-center gap-1">
            <input
              type="date"
              min=""
              max={todayString}
              value={dateStartValue}
              onChange={(e) => {
                onDateStartChange(e.target.value);
              }}
              className="rounded border border-[#222230] bg-[#16161e] px-2 py-1.5 text-sm text-[#f0f0f5]"
            />
            <input
              type="date"
              min=""
              max={todayString}
              value={dateEndValue}
              onChange={(e) => {
                onDateEndChange(e.target.value);
              }}
              className="rounded border border-[#222230] bg-[#16161e] px-2 py-1.5 text-sm text-[#f0f0f5]"
            />
          </div>
        )}
      {showSearch && (
        <div className="relative ml-1">
          <input
            type="text"
            placeholder={mode === 'vods' ? 'Search by Title' : 'Search by Game'}
            onChange={(e) => onSearchChange(e.target.value)}
            value={searchValue}
            className="w-44 rounded border border-[#222230] bg-[#16161e] px-3 py-1.5 pr-8 text-sm text-[#f0f0f5] placeholder-[#9ca3af]"
          />
          {searchValue && (
            <button
              onClick={onSearchClear}
              className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer text-[#9ca3af] transition-colors hover:text-[#f0f0f5]"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}
      {extraControls}
    </div>
  );
}
