import { useState, useRef, useCallback, useEffect } from 'react';
import type { Comment, MessageFragment } from '@/types';
import { archiveClient } from '@/utils/archive-client';

const SCROLL_TOLERANCE = 250;

interface UseChatMessagesOptions {
  channel: string;
  vodId: string;
  playerRef: React.RefObject<unknown>;
  getCurrentTime: () => number;
  isPlaying: () => boolean;
  shouldFilterMessage: (message: string) => boolean;
}

export interface UseChatMessagesReturn {
  shownMessages: Comment[];
  scrolling: boolean;
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
  chatRef: React.RefObject<HTMLElement | null>;
  commentsRef: React.RefObject<Comment[]>;
  cursorRef: React.RefObject<string | null>;
  handleScroll: () => void;
  scrollToBottom: () => void;
  startLoop: () => void;
  stopLoop: () => void;
  fetchComments: (offset?: number) => void;
}

export function useChatMessages({
  channel,
  vodId,
  playerRef,
  getCurrentTime,
  isPlaying,
  shouldFilterMessage,
}: UseChatMessagesOptions): UseChatMessagesReturn {
  const [shownMessages, setShownMessages] = useState<Comment[]>([]);
  const [scrolling, setScrolling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const commentsRef = useRef<Comment[]>([]);
  const cursorRef = useRef<string | null>(null);
  const loopRef = useRef<number | null>(null);
  const loopCbRef = useRef<(() => void) | undefined>(undefined);
  const chatRef = useRef<HTMLElement | null>(null);
  const stoppedAtIndexRef = useRef(0);
  const newMessagesRef = useRef<Comment[]>([]);
  const paginationAbortRef = useRef<AbortController | null>(null);
  const isFetchingNextRef = useRef(false);
  const lastFetchedCursorRef = useRef<string | null>(null);
  const lastScrollHeightRef = useRef(0);
  const isAutoScrollingRef = useRef(false);
  const lastScrollTopRef = useRef(0);
  const scrollingRef = useRef(scrolling);
  const hasFetchedRef = useRef(false);
  const isAtBottomRef = useRef(true);

  useEffect(() => {
    scrollingRef.current = scrolling;
  }, [scrolling]);

  const buildComments = useCallback(() => {
    if (
      !playerRef.current ||
      commentsRef.current.length === 0 ||
      !cursorRef.current ||
      stoppedAtIndexRef.current === null
    )
      return;
    if (!isPlaying()) return;

    const time = getCurrentTime();

    if (
      stoppedAtIndexRef.current > 0 &&
      commentsRef.current[stoppedAtIndexRef.current - 1] &&
      commentsRef.current[stoppedAtIndexRef.current - 1].content_offset_seconds > time
    ) {
      setShownMessages([]);
      stoppedAtIndexRef.current = 0;
    }

    let lastIndex = commentsRef.current.length;
    for (let i = stoppedAtIndexRef.current; i < commentsRef.current.length; i++) {
      if (commentsRef.current[i].content_offset_seconds > time) {
        lastIndex = i;
        break;
      }
    }

    if (stoppedAtIndexRef.current === lastIndex && stoppedAtIndexRef.current !== 0) return;

    const fetchNextComments = () => {
      if (isFetchingNextRef.current) return;
      if (cursorRef.current === lastFetchedCursorRef.current) return;

      isFetchingNextRef.current = true;

      if (paginationAbortRef.current) {
        paginationAbortRef.current.abort();
      }
      paginationAbortRef.current = new AbortController();
      lastFetchedCursorRef.current = cursorRef.current;

      archiveClient.vods
        .comments(channel, vodId, { cursor: cursorRef.current ?? '' })
        .then((response) => {
          if (!response.success) {
            throw response;
          }
          return response.data;
        })
        .then((data) => {
          stoppedAtIndexRef.current = 0;
          commentsRef.current = data.comments;
          cursorRef.current = data.cursor;
        })
        .catch((e) => {
          if (e.name !== 'AbortError') {
            console.error(e);
          }
        })
        .finally(() => {
          isFetchingNextRef.current = false;
        });
    };

    newMessagesRef.current = [];
    for (let i = stoppedAtIndexRef.current; i < lastIndex; i++) {
      const comment = commentsRef.current[i];
      if (!comment.message) continue;

      const messageText = comment.message.map((fragment: MessageFragment) => fragment.text).join(' ');

      if (shouldFilterMessage(messageText)) {
        continue;
      }

      newMessagesRef.current.push(comment);
    }

    if (newMessagesRef.current.length > 0) {
      setShownMessages((prevShownMessages) => {
        const existingIds = new Set(prevShownMessages.map((msg) => msg.id));

        const uniqueNewMessages = newMessagesRef.current.filter((msg) => !existingIds.has(msg.id));

        const concatMessages = prevShownMessages.concat(uniqueNewMessages);

        if (concatMessages.length > 200) {
          concatMessages.splice(0, concatMessages.length - 200);
        }
        return concatMessages;
      });

      stoppedAtIndexRef.current = lastIndex;
      if (!isFetchingNextRef.current && commentsRef.current.length === lastIndex) fetchNextComments();
    }
  }, [playerRef, getCurrentTime, isPlaying, shouldFilterMessage, channel, vodId]);

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
    const isAtBottom = distanceFromBottom <= SCROLL_TOLERANCE;

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

  const startLoop = useCallback(() => {
    if (loopRef.current !== null) clearInterval(loopRef.current);
    buildComments();
    loopRef.current = setInterval(buildComments, 1000);
    return () => {
      if (loopRef.current !== null) {
        clearInterval(loopRef.current);
        loopRef.current = null;
      }
    };
  }, [buildComments]);

  const stopLoop = useCallback(() => {
    if (loopRef.current !== null) clearInterval(loopRef.current);
  }, []);

  const fetchComments = useCallback(
    (offset: number = 0) => {
      archiveClient.vods
        .comments(channel, vodId, { content_offset_seconds: String(Math.floor(offset)) })
        .then((response) => {
          if (!response.success) {
            throw response;
          }
          return response.data;
        })
        .then((data) => {
          commentsRef.current = data.comments;
          cursorRef.current = data.cursor;
        })
        .catch((e) => {
          if (e.name !== 'AbortError') {
            console.error(e);
          }
        })
        .finally(() => {
          if (!hasFetchedRef.current) {
            hasFetchedRef.current = true;
            setIsLoading(false);
          }
        });
    },
    [channel, vodId]
  );

  useEffect(() => {
    loopCbRef.current = startLoop;
  }, [startLoop]);

  useEffect(() => {
    if (scrolling || !isAtBottomRef.current || shownMessages.length === 0) return;
    scrollToBottom();
  }, [shownMessages, scrolling, scrollToBottom]);

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

  useEffect(() => {
    return () => {
      if (paginationAbortRef.current) paginationAbortRef.current.abort();
    };
  }, []);

  return {
    shownMessages,
    scrolling,
    isLoading,
    setIsLoading,
    chatRef,
    commentsRef,
    cursorRef,
    handleScroll,
    scrollToBottom,
    startLoop,
    stopLoop,
    fetchComments,
  };
}
