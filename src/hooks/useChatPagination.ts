import { useRef, useCallback, useEffect } from 'react';
import type { Comment } from '@/types';
import { archiveClient } from '@/utils/archive-client';

interface UseChatPaginationOptions {
  tenant: string;
  vodId: string;
  cursorRef: React.RefObject<string | null>;
  commentsRef: React.RefObject<Comment[]>;
  onPaginationComplete: () => void;
}

export interface UseChatPaginationReturn {
  isFetchingNext: boolean;
  fetchNext: () => void;
}

export function useChatPagination({
  tenant,
  vodId,
  cursorRef,
  commentsRef,
  onPaginationComplete,
}: UseChatPaginationOptions): UseChatPaginationReturn {
  const paginationAbortRef = useRef<AbortController | null>(null);
  const isFetchingNextRef = useRef(false);
  const lastFetchedCursorRef = useRef<string | null>(null);

  const fetchNext = useCallback(() => {
    if (isFetchingNextRef.current) return;
    if (cursorRef.current === lastFetchedCursorRef.current) return;
    isFetchingNextRef.current = true;
    if (paginationAbortRef.current) paginationAbortRef.current.abort();
    paginationAbortRef.current = new AbortController();
    lastFetchedCursorRef.current = cursorRef.current;

    archiveClient.vods
      .comments(tenant, vodId, { cursor: cursorRef.current ?? '' })
      .then((response) => {
        if (!response.success) throw response;
        return response.data;
      })
      .then((data) => {
        // eslint-disable-next-line react-compiler/react-compiler -- ref mutation for pagination state
        commentsRef.current = data.comments;

        cursorRef.current = data.cursor;
        onPaginationComplete();
      })
      .catch((e) => {
        if (e.name !== 'AbortError') console.error(e);
      })
      .finally(() => {
        isFetchingNextRef.current = false;
      });
  }, [tenant, vodId, cursorRef, commentsRef, onPaginationComplete]);

  useEffect(() => {
    return () => {
      if (paginationAbortRef.current) paginationAbortRef.current.abort();
    };
  }, []);

  return { isFetchingNext: isFetchingNextRef.current, fetchNext };
}
