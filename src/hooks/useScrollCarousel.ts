import { useState, useRef, useCallback, useEffect } from 'react';

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
  const offsetRef = useRef(offset);
  offsetRef.current = offset;

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
        const cardWidth = containerRef.current.clientWidth / visibleCount;
        containerRef.current.scrollTo({
          left: containerRef.current.scrollLeft + cardWidth * amount,
          behavior: 'smooth',
        });
      }
    },
    [offset, itemCount, visibleCount]
  );

  // Sync internal offset with native scroll position (drag/trackpad/keyboard)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let rafId: number;
    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const scrollRatio = el.scrollLeft / el.clientWidth;
        const newOffset = Math.max(0, Math.round(scrollRatio * visibleCount));
        if (newOffset !== offsetRef.current) {
          setOffset(newOffset);
        }
      });
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [visibleCount]);

  // Keep arrows in sync when container resizes (responsive breakpoints)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      const scrollRatio = el.scrollLeft / el.clientWidth;
      const newOffset = Math.max(0, Math.round(scrollRatio * visibleCount));
      if (newOffset !== offsetRef.current) {
        setOffset(newOffset);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [visibleCount]);

  if (autoCenterIndex !== undefined && autoCenterIndex >= 0) {
    const newOffset = Math.max(0, Math.min(autoCenterIndex - 2, itemCount - visibleCount));
    if (newOffset !== offset) {
      setOffset(newOffset);
    }
  }

  return { offset, showLeft, showRight, visibleItems, scrollBy, containerRef };
}
