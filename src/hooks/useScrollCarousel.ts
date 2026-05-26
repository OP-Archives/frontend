import { useState, useRef, useCallback } from 'react';

interface UseScrollCarouselOptions {
  itemCount: number;
  visibleCount?: number;
  initialOffset?: number;
  autoCenterIndex?: number;
}

export interface UseScrollCarouselReturn {
  offset: number;
  showLeft: boolean;
  showRight: boolean;
  visibleItems: <T>(allItems: T[]) => T[];
  scrollBy: (amount: number) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function useScrollCarousel({
  itemCount,
  visibleCount = 5,
  initialOffset = 0,
  autoCenterIndex,
}: UseScrollCarouselOptions): UseScrollCarouselReturn {
  const [offset, setOffset] = useState(initialOffset);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const showLeft = offset > 0;
  const showRight = offset + visibleCount < itemCount;

  const visibleItems = useCallback(
    <T>(allItems: T[]): T[] => {
      return allItems.slice(offset, offset + visibleCount);
    },
    [offset, visibleCount]
  );

  const scrollBy = useCallback(
    (amount: number) => {
      const newOffset = Math.max(0, Math.min(offset + amount, itemCount - visibleCount));
      setOffset(newOffset);
      if (containerRef.current) {
        containerRef.current.scrollTo({
          left: containerRef.current.clientWidth * (amount / visibleCount),
          behavior: 'smooth',
        });
      }
    },
    [offset, itemCount, visibleCount]
  );

  if (autoCenterIndex !== undefined && autoCenterIndex >= 0) {
    const newOffset = Math.max(0, Math.min(autoCenterIndex - 2, itemCount - visibleCount));
    if (newOffset !== offset) {
      setOffset(newOffset);
    }
  }

  return { offset, showLeft, showRight, visibleItems, scrollBy, containerRef };
}
