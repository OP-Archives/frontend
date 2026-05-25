import { useCallback, useRef, useEffect, useLayoutEffect, useState } from 'react';

export const useDebouncedSetter = (setter: (_value: string) => void, delay: number) => {
  const timeoutRef = useRef<number | null>(null);
  const setterRef = useRef(setter);

  useLayoutEffect(() => {
    setterRef.current = setter;
  }, [setter]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  return (value: string) => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);

    timeoutRef.current = window.setTimeout(() => {
      setterRef.current(value);
    }, delay);
  };
};

export function useDebounce(value: string, options: { debounceMs?: number } = {}): string {
  const { debounceMs = 300 } = options;
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), debounceMs);
    return () => clearTimeout(timer);
  }, [value, debounceMs]);

  return debouncedValue;
}

export function useDebouncedCallback(callback: (..._args: unknown[]) => void, delay: number) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  useLayoutEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (...args: unknown[]) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );
}
