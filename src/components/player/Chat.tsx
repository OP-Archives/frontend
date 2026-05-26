import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useState, useEffect, useRef } from 'react';
import ChatHeader from './Chat/ChatHeader';
import ChatMessages from './Chat/ChatMessages';
import ChatSettingsModal from './Chat/ChatSettingsModal';
import { MemoizedComment, useChatMessageRenderer } from './ChatMessageRenderer';
import { useChatEmotes } from '@/hooks/useChatEmotes';
import { useChatLoop } from '@/hooks/useChatLoop';
import { useChatPagination } from '@/hooks/useChatPagination';
import { useChatScroll } from '@/hooks/useChatScroll';
import { useChatSettings } from '@/hooks/useChatSettings';
import { useTypedParams } from '@/hooks/useTypedParams';
import type { Badge, PartInfo, VODUpload, GameEntry } from '@/types';
import { unwrap } from '@/utils/api';
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

  const shouldFilterMessage = useCallback(
    (message: string): boolean => {
      const regex = settings.filterRegex;
      if (!regex) return false;
      const pattern = new RegExp(regex.source, regex.flags);
      return pattern.test(message);
    },
    [settings.filterRegex]
  );

  const badgesRef = useRef(badges);
  useEffect(() => {
    badgesRef.current = badges;
  }, [badges]);

  const { transformMessage, transformBadges } = useChatMessageRenderer({
    emoteLookup,
    getEmoteImageUrl,
    getEmoteImageSrcSet,
    seventvIsZeroWidth,
    badgesRef,
  });

  const { shownMessages, isLoading, commentsRef, cursorRef, stoppedAtIndexRef } = useChatLoop({
    playerRef,
    vodId,
    tenant,
    getCurrentTime,
    isPlaying,
    shouldFilterMessage,
    playerState,
  });

  const { fetchNext } = useChatPagination({
    tenant,
    vodId,
    cursorRef,
    commentsRef,
    onPaginationComplete: () => {
      // eslint-disable-next-line react-compiler/react-compiler -- ref mutation for chat loop state
      stoppedAtIndexRef.current = 0;
    },
  });

  const { scrolling, scrollToBottom, handleScroll, chatRef } = useChatScroll({
    shownMessagesLength: shownMessages.length,
  });

  useEffect(() => {
    if (
      shownMessages.length > 0 &&
      stoppedAtIndexRef.current > 0 &&
      commentsRef.current.length === stoppedAtIndexRef.current
    ) {
      fetchNext();
    }
  }, [shownMessages.length, stoppedAtIndexRef.current, commentsRef.current.length, fetchNext]);

  useEffect(() => {
    unwrap(archiveClient.badges.twitch(tenant!))
      .then((data) => {
        setBadges(data || { channel: [], global: [] });
      })
      .catch((e) => {
        if (e.name !== 'AbortError') {
          console.error('Badge loading failed:', e);
          setBadges({ channel: [], global: [] });
        }
      });
  }, [vodId, tenant]);

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
