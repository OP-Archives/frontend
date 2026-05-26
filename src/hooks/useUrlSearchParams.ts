import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useUrlSearchParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, val] of Object.entries(updates)) {
            if (val) next.set(key, val);
            else next.delete(key);
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  return { searchParams, updateParams };
}
