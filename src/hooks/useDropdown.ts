import { useState, useEffect, useRef } from 'react';

export interface UseDropdownReturn {
  anchorEl: HTMLElement | null;
  position: { top?: number; bottom?: number; left?: number; right?: number; maxWidth?: number };
  isOpen: boolean;
  setMenuRef: (el: HTMLDivElement | null) => void;
  open: (
    el: HTMLElement,
    position?: { top?: number; bottom?: number; left?: number; right?: number; maxWidth?: number }
  ) => void;
  close: () => void;
  toggle: (
    el: HTMLElement,
    position?: { top?: number; bottom?: number; left?: number; right?: number; maxWidth?: number }
  ) => void;
}

export function useDropdown(initialMaxHeight?: number): UseDropdownReturn {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [position, setPosition] = useState<{
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    maxWidth?: number;
  }>({});
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!anchorEl) {
      return;
    }

    const handleOutsideInteraction = (e: Event) => {
      if (e instanceof KeyboardEvent && e.key === 'Escape') {
        setAnchorEl(null);
        return;
      }

      if (menuRef.current && menuRef.current.contains(e.target as Node)) {
        return;
      }

      if (e.type !== 'keydown') {
        setAnchorEl(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideInteraction);
    document.addEventListener('wheel', handleOutsideInteraction, { capture: true, passive: true });
    document.addEventListener('touchmove', handleOutsideInteraction, {
      capture: true,
      passive: true,
    });
    document.addEventListener('keydown', handleOutsideInteraction);

    return () => {
      document.removeEventListener('mousedown', handleOutsideInteraction);
      document.removeEventListener('wheel', handleOutsideInteraction, { capture: true });
      document.removeEventListener('touchmove', handleOutsideInteraction, { capture: true });
      document.removeEventListener('keydown', handleOutsideInteraction);
    };
  }, [anchorEl]);

  const close = () => {
    setAnchorEl(null);
  };

  const setMenuRef = (el: HTMLDivElement | null) => {
    menuRef.current = el;
  };

  const open = (
    el: HTMLElement,
    position?: { top?: number; bottom?: number; left?: number; right?: number; maxWidth?: number }
  ) => {
    setAnchorEl(el);
    if (position) {
      setPosition(position);
    }
  };

  const toggle = (
    el: HTMLElement,
    position?: { top?: number; bottom?: number; left?: number; right?: number; maxWidth?: number }
  ) => {
    if (anchorEl) {
      setAnchorEl(null);
    } else {
      const rect = el.getBoundingClientRect();
      const defaultPosition: { top?: number; bottom?: number; left?: number; right?: number; maxWidth?: number } = {
        top: rect.bottom + 4,
        left: rect.left,
      };

      if (initialMaxHeight !== undefined) {
        const spaceBelow = window.innerHeight - rect.bottom;

        if (spaceBelow < initialMaxHeight && rect.top > spaceBelow) {
          delete defaultPosition.top;

          defaultPosition.bottom = window.innerHeight - rect.top + 8;
          defaultPosition.maxWidth = window.innerWidth - rect.left - 16;
        } else {
          defaultPosition.top = rect.bottom + 8;
          defaultPosition.maxWidth = window.innerWidth - rect.left - 16;
        }
      }

      setPosition(position || defaultPosition);
      setAnchorEl(el);
    }
  };

  return {
    anchorEl,
    position,
    isOpen: !!anchorEl,
    setMenuRef,
    open,
    close,
    toggle,
  };
}
