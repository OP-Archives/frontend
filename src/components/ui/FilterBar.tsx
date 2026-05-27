import { ArrowLeft, X } from 'lucide-react';
import { type ReactNode } from 'react';
import { DatePicker } from './DatePicker';

interface FilterBarProps {
  mode: 'vods' | 'games' | 'library';
  filterValue: string;
  onFilterChange: (value: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  debouncedOnSearchChange?: (value: string) => void;
  onSearchClear: () => void;
  dateStartValue?: string;
  dateEndValue?: string;
  onDateStartChange?: (value: string) => void;
  onDateEndChange?: (value: string) => void;
  maxDate?: string;
  showDateRange?: boolean;
  showSearch?: boolean;
  disabled?: boolean;
  gameId?: string | null;
  onBack?: () => void;
  hasBackButton?: boolean;
  extraControls?: ReactNode;
  filterOptions?: string[];
  showFilter?: boolean;
  searchPlaceholder?: string;
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
  searchPlaceholder,
  debouncedOnSearchChange,
  maxDate,
}: FilterBarProps) {
  return (
    <div className="flex flex-row flex-wrap items-center gap-2 pt-1">
      {hasBackButton && (
        <button
          onClick={onBack}
          className="border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 mr-2 flex h-9 items-center gap-1 rounded-md border px-3 text-sm transition-all duration-200"
        >
          <ArrowLeft size={16} /> Back
        </button>
      )}
      {showFilter && (
        <select
          disabled={disabled || !!gameId}
          value={filterValue}
          onChange={(e) => onFilterChange(e.target.value)}
          className="border-border bg-bg-surface text-text-primary hover:border-border/80 focus:border-primary focus:ring-primary/30 mr-1 h-9 w-max rounded-md border px-3 text-sm transition-all duration-200 focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
            <DatePicker value={dateStartValue} onChange={onDateStartChange} maxDate={maxDate} />
            <DatePicker value={dateEndValue} onChange={onDateEndChange} maxDate={maxDate} />
          </div>
        )}
      {showSearch && (
        <div className="relative ml-1">
          <input
            type="text"
            placeholder={searchPlaceholder ?? (mode === 'vods' ? 'Search by Title' : 'Search by Game')}
            onChange={(e) => {
              onSearchChange(e.target.value);
              debouncedOnSearchChange?.(e.target.value);
            }}
            value={searchValue}
            className="border-border bg-bg-surface text-text-primary placeholder-text-secondary hover:border-border/80 focus:border-primary focus:ring-primary/30 h-9 w-44 rounded-md border px-3 pr-8 text-sm transition-all duration-200 focus:ring-1 focus:outline-none"
          />
          {searchValue && (
            <button
              onClick={onSearchClear}
              className="text-text-secondary hover:text-text-primary absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer transition-colors"
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
