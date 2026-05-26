import { useState, useRef, useEffect, useCallback } from 'react';
import type { Comment, MessageFragment } from '@/types';
import { archiveClient } from '@/utils/archive-client';

interface UseChatLoopOptions {
  playerRef: React.RefObject<unknown>;
  vodId: string;
  tenant: string;
  getCurrentTime: () => number;
  isPlaying: () => boolean;
  shouldFilterMessage: (message: string) => boolean;
  playerState: number;
  onPaginationNeeded?: () => void;
}

export interface UseChatLoopReturn {
  shownMessages: Comment[];
  isLoading: boolean;
  commentsRef: React.RefObject<Comment[]>;
  cursorRef: React.RefObject<string | null>;
  stoppedAtIndexRef: React.RefObject<number>;
  startLoop: () => void;
  stopLoop: () => void;
  fetchComments: (offset?: number) => void;
}

export function useChatLoop({
  playerRef,
  vodId,
  tenant,
  getCurrentTime,
  isPlaying,
  shouldFilterMessage,
  playerState,
  onPaginationNeeded,
}: UseChatLoopOptions): UseChatLoopReturn {
  const [shownMessages, setShownMessages] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const commentsRef = useRef<Comment[]>([]);
  const cursorRef = useRef<string | null>(null);
  const loopRef = useRef<number | null>(null);
  const loopCbRef = useRef<(() => void) | undefined>(undefined);
  const stoppedAtIndexRef = useRef(0);
  const newMessagesRef = useRef<Comment[]>([]);
  const hasFetchedRef = useRef(false);
  const playRef = useRef<number | null>(null);
  const isFetchingNextRef = useRef(false);

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

    newMessagesRef.current = [];
    for (let i = stoppedAtIndexRef.current; i < lastIndex; i++) {
      const comment = commentsRef.current[i];
      if (!comment.message) continue;
      const messageText = comment.message.map((fragment: MessageFragment) => fragment.text).join(' ');
      if (shouldFilterMessage(messageText)) continue;
      newMessagesRef.current.push(comment);
    }

    if (newMessagesRef.current.length > 0) {
      setShownMessages((prev: Comment[]) => {
        const existingIds = new Set(prev.map((msg) => msg.id));
        const uniqueNewMessages = newMessagesRef.current.filter((msg) => !existingIds.has(msg.id));
        const concatMessages = prev.concat(uniqueNewMessages);
        if (concatMessages.length > 200) concatMessages.splice(0, concatMessages.length - 200);
        return concatMessages;
      });
      stoppedAtIndexRef.current = lastIndex;
      if (onPaginationNeeded && !isFetchingNextRef.current && commentsRef.current.length === lastIndex) {
        onPaginationNeeded();
      }
    }
  }, [playerRef, getCurrentTime, isPlaying, shouldFilterMessage, onPaginationNeeded]);

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
        .comments(tenant, vodId, { content_offset_seconds: String(Math.floor(offset)) })
        .then((response) => {
          if (!response.success) throw response;
          return response.data;
        })
        .then((data) => {
          commentsRef.current = data.comments;
          cursorRef.current = data.cursor;
        })
        .catch((e) => {
          if (e.name !== 'AbortError') console.error(e);
        })
        .finally(() => {
          if (!hasFetchedRef.current) {
            hasFetchedRef.current = true;
            setIsLoading(false);
          }
        });
    },
    [tenant, vodId]
  );

  useEffect(() => {
    loopCbRef.current = startLoop;
  }, [startLoop]);

  useEffect(() => {
    const abortController = new AbortController();
    if (playRef.current) clearTimeout(playRef.current);
    if (playerState === -1 || !playerRef.current) return;

    const handlePlayerStateChange = () => {
      if (playerState === 1) {
        const time = getCurrentTime();
        if (
          commentsRef.current.length === 0 ||
          time < commentsRef.current[0].content_offset_seconds ||
          time > commentsRef.current[commentsRef.current.length - 1].content_offset_seconds
        ) {
          playRef.current = setTimeout(() => {
            stopLoop();
            stoppedAtIndexRef.current = 0;
            commentsRef.current = [];
            cursorRef.current = null;
            setShownMessages([]);
            hasFetchedRef.current = false;
            setIsLoading(true);
            fetchComments(time);
            loopCbRef.current?.();
          }, 300);
        } else {
          loopCbRef.current?.();
        }
      } else {
        stopLoop();
      }
    };

    handlePlayerStateChange();

    return () => {
      abortController.abort();
      stopLoop();
      if (playRef.current) clearTimeout(playRef.current);
    };
  }, [playerRef, playerState, getCurrentTime, stopLoop, fetchComments]);

  return {
    shownMessages,
    isLoading,
    commentsRef,
    cursorRef,
    stoppedAtIndexRef,
    startLoop,
    stopLoop,
    fetchComments,
  };
}
