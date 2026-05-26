import { DayPicker } from '@daypicker/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import '@daypicker/react/style.css';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  maxDate?: string;
}

export function DatePicker({ value, onChange, maxDate }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const [month, setMonth] = useState<Date>(() => {
    if (!value) return new Date();
    const d = new Date(value + 'T00:00:00');
    return isNaN(d.getTime()) ? new Date() : d;
  });

  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setMonth(d);
      }
    }
  }, [value]);

  const selected = value ? new Date(value + 'T00:00:00') : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;
    const year = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    onChange(`${year}-${m}-${d}`);
    setOpen(false);
  };

  const displayMonth = new Date(month.getFullYear(), month.getMonth(), 1);

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={value}
        readOnly
        onClick={() => setOpen(true)}
        placeholder="YYYY-MM-DD"
        className="border-border bg-bg-surface text-text-primary placeholder-text-secondary hover:border-border/80 focus:border-primary focus:ring-primary/30 h-9 w-36 rounded-md border px-3 text-sm transition-all duration-200 focus:ring-1 focus:outline-none"
      />
      {open && (
        <div className="border-border bg-bg-surface absolute z-50 mt-1 rounded-md border p-2 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1));
              }}
              className="text-text-secondary hover:bg-border hover:text-text-primary rounded-md p-1 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-text-primary text-sm font-medium">
              {displayMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button
              type="button"
              onClick={() => {
                setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1));
              }}
              className="text-text-secondary hover:bg-border hover:text-text-primary rounded-md p-1 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <DayPicker
            mode="single"
            selected={selected}
            month={displayMonth}
            onMonthChange={setMonth}
            onSelect={handleSelect}
            disabled={maxDate ? { after: new Date(maxDate + 'T23:59:59') } : undefined}
            classNames={{
              month_caption: 'hidden',
              nav: 'hidden',
              dropdowns: 'hidden',
            }}
            styles={{
              day_button: {
                width: '36px',
                height: '36px',
                fontSize: '14px',
                borderRadius: '6px',
                borderWidth: '0px',
              },
              caption_label: {
                fontSize: '14px',
                fontWeight: 500,
              },
            }}
          />
        </div>
      )}
    </div>
  );
}
