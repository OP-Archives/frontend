import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import ChatHeader from './Chat/ChatHeader';
import ChatMessages from './Chat/ChatMessages';
import ChatSettingsModal from './Chat/ChatSettingsModal';
import { MemoizedComment, useChatMessageRenderer } from './ChatMessageRenderer';
import { useChatEmotes } from '@/hooks/useChatEmotes';
import { useChatSettings } from '@/hooks/useChatSettings';
import { useTypedParams } from '@/hooks/useTypedParams';
import type { Comment, Badge, PartInfo, VODUpload, GameEntry, MessageFragment } from '@/types';
import { archiveClient } from '@/utils/archive-client';

interface ChatProps {
  isPortrait: boolean;
  vodId: string;
  playerRef: React.RefObject<unknown>;
  userChatDelay: number;
  delay?: number;
  youtube?: VODUpload[];
  part?: PartInfo | null;
  games?: GameEntry[];
  isYoutubeVod?: boolean;
  playerState: import('@/types').PlayerState;
  setUserChatDelay: (_v: number) => void;
  twitchId?: number;
  chatOnLeft: boolean;
  setChatOnLeft: (_v: boolean) => void;
}

export default function Chat(props: ChatProps) {
  const { tenant } = useTypedParams<{ tenant: string }>();
  const { isPortrait, vodId, playerRef, delay, youtube, part, games, isYoutubeVod, playerState, twitchId, chatOnLeft } =
    props;

  const [showChat, setShowChat] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [shownMessages, setShownMessages] = useState<Comment[]>([]);
  const [scrolling, setScrolling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [badges, setBadges] = useState<Record<'channel' | 'global', Badge[]>>({ channel: [], global: [] });

  const settings = useChatSettings();

  const getCurrentTime = useCallback(() => {
    const current = playerRef.current;
    if (!current) return 0;
    let time = 0;
    if (youtube && isYoutubeVod) {
      for (let i = 0; i < youtube.length; i++) {
        const video = youtube[i];
        if (i + 1 >= (part?.part ?? 1)) break;
        time += video.duration ?? 0;
      }
      time += (current as { getCurrentTime?: () => number }).getCurrentTime?.() ?? 0;
    } else if (games) {
      time += parseFloat(games![(part?.part ?? 1) - 1].start);
      time += (current as { getCurrentTime?: () => number }).getCurrentTime?.() ?? 0;
    } else {
      time += (current as { currentTime?: number }).currentTime ?? 0;
    }
    time += delay ?? 0;
    time += settings.userChatDelay ?? 0;
    return time;
  }, [playerRef, youtube, delay, part, settings.userChatDelay, games, isYoutubeVod]);

  const isPlaying = useCallback(() => {
    const current = playerRef.current;
    if (!current) return false;
    if (isYoutubeVod || games) {
      return (current as { getPlayerState?: () => number }).getPlayerState?.() === 1;
    }
    return !!(current as { paused?: boolean }).paused === false;
  }, [isYoutubeVod, games, playerRef]);

  const { emoteLookup, getEmoteImageUrl, getEmoteImageSrcSet, seventvIsZeroWidth } = useChatEmotes({
    channel: tenant!,
    vodId,
    twitchId,
  });

  const badgesRef = useRef(badges);
  useEffect(() => {
    badgesRef.current = badges;
  }, [badges]);

  const shouldFilterMessage = useCallback(
    (message: string): boolean => {
      const regex = settings.filterRegex;
      if (!regex) return false;
      const pattern = new RegExp(regex.source, regex.flags);
      return pattern.test(message);
    },
    [settings.filterRegex]
  );

  const { transformMessage, transformBadges } = useChatMessageRenderer({
    emoteLookup,
    getEmoteImageUrl,
    getEmoteImageSrcSet,
    seventvIsZeroWidth,
    badgesRef,
  });

  const commentsRef = useRef<Comment[]>([]);
  const cursorRef = useRef<string | null>(null);
  const loopRef = useRef<number | null>(null);
  const loopCbRef = useRef<(() => void) | undefined>(undefined);
  const playRef = useRef<number | null>(null);
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
      if (paginationAbortRef.current) paginationAbortRef.current.abort();
      paginationAbortRef.current = new AbortController();
      lastFetchedCursorRef.current = cursorRef.current;

      archiveClient.vods
        .comments(tenant!, vodId, { cursor: cursorRef.current ?? '' })
        .then((response) => {
          if (!response.success) throw response;
          return response.data;
        })
        .then((data) => {
          stoppedAtIndexRef.current = 0;
          commentsRef.current = data.comments;
          cursorRef.current = data.cursor;
        })
        .catch((e) => {
          if (e.name !== 'AbortError') console.error(e);
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
      if (!isFetchingNextRef.current && commentsRef.current.length === lastIndex) fetchNextComments();
    }
  }, [playerRef, getCurrentTime, isPlaying, shouldFilterMessage, tenant, vodId]);

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
        .comments(tenant!, vodId, { content_offset_seconds: String(Math.floor(offset)) })
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

  useEffect(() => {
    const abortController = new AbortController();

    const loadBadges = () => {
      archiveClient.badges
        .twitch(tenant!)
        .then((response) => {
          if (!response.success) throw response;
          return response.data;
        })
        .then((data) => {
          setBadges(data || { channel: [], global: [] });
        })
        .catch((e) => {
          if (e.name !== 'AbortError') {
            console.error('Badge loading failed:', e);
            setBadges({ channel: [], global: [] });
          }
        });
    };

    loadBadges();
    return () => {
      abortController.abort();
    };
  }, [vodId, twitchId, tenant]);

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
  }, [vodId, playerRef, playerState, getCurrentTime, stopLoop, fetchComments, tenant]);

  return (
    <div
      className={`${isPortrait ? 'w-full flex-1' : 'shrink-0 self-stretch'} relative flex min-h-0 min-w-0 flex-col bg-[#16161e]`}
    >
      {showChat && (
        <>
          <ChatHeader
            isPortrait={isPortrait}
            showChat={showChat}
            setShowChat={setShowChat}
            setShowModal={setShowModal}
            chatOnLeft={chatOnLeft}
          />
          <hr className="border-t border-[#222230]" />
          <div
            className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
            style={{ width: isPortrait ? '100%' : `${settings.chatWidth || 340}px` }}
          >
            <ChatMessages
              comments={commentsRef}
              isLoading={isLoading}
              shownMessages={shownMessages.map((comment) => (
                <MemoizedComment
                  key={comment.id}
                  comment={comment}
                  showTimestamp={settings.showTimestamp}
                  transformBadges={transformBadges}
                  transformMessage={transformMessage}
                  fontFamily={settings.fontFamily}
                  messageFontSize={settings.messageFontSize}
                />
              ))}
              scrolling={scrolling}
              scrollToBottom={scrollToBottom}
              chatRef={chatRef}
              handleScroll={handleScroll}
            />
          </div>
        </>
      )}
      {!isPortrait && !showChat && (
        <div className={`absolute top-2 ${chatOnLeft ? 'left-2' : 'right-2'} z-50`}>
          <button
            onClick={() => setShowChat(!showChat)}
            className={`flex cursor-pointer items-center justify-center border border-[#222230] bg-[#16161e] p-1.5 text-white shadow-xl transition-all hover:bg-[#18181b] hover:text-gray-300 ${chatOnLeft ? 'rounded-r-lg border-l-0' : 'rounded-l-lg border-r-0'}`}
            title="Expand Chat"
          >
            {chatOnLeft ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      )}
      <ChatSettingsModal
        userChatDelay={settings.userChatDelay}
        setUserChatDelay={settings.setUserChatDelay}
        showModal={showModal}
        setShowModal={setShowModal}
        showTimestamp={settings.showTimestamp}
        setShowTimestamp={settings.setShowTimestamp}
        chatWidth={settings.chatWidth}
        setChatWidth={settings.setChatWidth}
        fontFamily={settings.fontFamily}
        setFontFamily={settings.setFontFamily}
        messageFontSize={settings.messageFontSize}
        setMessageFontSize={settings.setMessageFontSize}
        chatOnLeft={settings.chatOnLeft}
        setChatOnLeft={settings.setChatOnLeft}
      />
    </div>
  );
}
