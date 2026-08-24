import { useEffect, useState } from 'react';
import { safeLocalStorage } from '@/utils/safeLocalStorage';

export function usePlayerLayout(_vodId: string) {
  const [isPortrait, setIsPortrait] = useState(window.matchMedia('(orientation: portrait)').matches);
  const [chatOnLeft, setChatOnLeft] = useState(false);

  useEffect(() => {
    // Combined media query: width-based breakpoint for desktop, orientation-based for touch devices
    const mql = window.matchMedia(
      '(pointer: fine) and (max-width: 1024px), (pointer: coarse) and (orientation: portrait)'
    );
    setIsPortrait(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsPortrait(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const savedSettings = safeLocalStorage.getItem('chat-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings) || {};
        if (settings.chatOnLeft !== undefined) {
          setChatOnLeft(Boolean(settings.chatOnLeft));
        }
      } catch (e) {
        console.error('Failed to parse chat settings from localStorage', e);
      }
    }
  }, []);

  return { isPortrait, chatOnLeft, setChatOnLeft };
}
