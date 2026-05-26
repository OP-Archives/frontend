import { useState, useRef, useEffect, useCallback } from 'react';

interface UseChatScrollOptions {
  shownMessagesLength: number;
}

export interface UseChatScrollReturn {
  scrolling: boolean;
  setScrolling: (v: boolean) => void;
  scrollToBottom: () => void;
  handleScroll: () => void;
  chatRef: React.RefObject<HTMLElement | null>;
  isAtBottomRef: React.RefObject<boolean>;
}

export function useChatScroll({ shownMessagesLength }: UseChatScrollOptions): UseChatScrollReturn {
  const [scrolling, setScrolling] = useState(false);
  const chatRef = useRef<HTMLElement | null>(null);
  const scrollingRef = useRef(scrolling);
  const isAtBottomRef = useRef(true);
  const isAutoScrollingRef = useRef(false);
  const lastScrollHeightRef = useRef(0);
  const lastScrollTopRef = useRef(0);

  useEffect(() => {
    scrollingRef.current = scrolling;
  }, [scrolling]);

  const scrollToBottom = useCallback(() => {
    if (!chatRef.current) return;
    setScrolling(false);
    scrollingRef.current = false;
    isAtBottomRef.current = true;
    isAutoScrollingRef.current = true;
    const scrollToBottomSmooth = () => {
      if (scrollingRef.current || !isAtBottomRef.current) {
        isAutoScrollingRef.current = false;
        return;
      }
      if (chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
        setTimeout(() => {
          isAutoScrollingRef.current = false;
        }, 150);
      }
    };
    scrollToBottomSmooth();
  }, []);

  const handleScroll = useCallback(() => {
    if (!chatRef.current) return;
    if (isAutoScrollingRef.current) {
      lastScrollHeightRef.current = chatRef.current.scrollHeight;
      lastScrollTopRef.current = chatRef.current.scrollTop;
      return;
    }
    const { scrollTop, scrollHeight, clientHeight } = chatRef.current;
    if (scrollHeight !== lastScrollHeightRef.current) {
      lastScrollHeightRef.current = scrollHeight;
      lastScrollTopRef.current = scrollTop;
      return;
    }
    const isScrollingUp = scrollTop < lastScrollTopRef.current - 10;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    const isAtBottom = distanceFromBottom <= 250;
    if (isScrollingUp) {
      isAtBottomRef.current = false;
      setScrolling(true);
      scrollingRef.current = true;
    } else if (isAtBottom) {
      isAtBottomRef.current = true;
      setScrolling(false);
      scrollingRef.current = false;
    }
    lastScrollHeightRef.current = scrollHeight;
    lastScrollTopRef.current = scrollTop;
  }, []);

  useEffect(() => {
    if (scrolling || !isAtBottomRef.current || shownMessagesLength === 0) return;
    scrollToBottom();
  }, [shownMessagesLength, scrolling, scrollToBottom]);

  useEffect(() => {
    if (!chatRef.current) return;
    const innerContent = chatRef.current.firstElementChild;
    if (!innerContent) return;
    const resizeObserver = new ResizeObserver(() => {
      if (isAtBottomRef.current && !scrollingRef.current && chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
        lastScrollHeightRef.current = chatRef.current.scrollHeight;
        lastScrollTopRef.current = chatRef.current.scrollTop;
      }
    });
    resizeObserver.observe(innerContent);
    return () => resizeObserver.disconnect();
  }, []);

  return {
    scrolling,
    setScrolling,
    scrollToBottom,
    handleScroll,
    chatRef,
    isAtBottomRef,
  };
}
