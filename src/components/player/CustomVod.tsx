import { useEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import BaseVod from './BaseVod';
import Chat from './Chat/Chat';
import { PlayerTenantProfile } from '@/components/player/PlayerTenantProfile';
import { RecentItemsVods } from '@/components/player/RecentItems';
import { convertTimestamp } from '@/components/player/utils/helpers';
import Loading from '@/components/player/utils/Loading';
import { getResumePosition, saveResumePosition, clearResumePosition } from '@/components/player/utils/positionStorage';
import { useTenantContext } from '@/contexts/TenantContext';
import type { VOD, PlayerState } from '@/types';
import { archiveClient } from '@/utils/archive-client';

export interface CustomVodProps {
  logo?: string;
  cdnBase?: string;
  type?: 'cdn' | 'manual';
  twitchId?: number;
}

export default function CustomVod(props: CustomVodProps) {
  const { logo = '', cdnBase, twitchId } = props;
  const location = useLocation();
  const { vodId, tenant } = useParams<{ vodId: string; tenant: string }>();
  const channel = tenant || '';
  const { tenant: tenantData } = useTenantContext();
  const [vod, setVod] = useState<VOD | undefined>(undefined);
  const [timestamp, setTimestamp] = useState<number | undefined>(undefined);
  const [delay, setDelay] = useState(0);
  const [userChatDelay, setUserChatDelay] = useState(0);
  const [playerState, setPlayerState] = useState<PlayerState>(-1);
  const playerRef = useRef<HTMLVideoElement | null>(null);
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(orientation: portrait)');
    setIsPortrait(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsPortrait(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const abortController = new AbortController();

    document.title = `${vodId} - ${channel}`;
    const fetchVod = async () => {
      try {
        const response = await archiveClient.vods.get(channel, vodId!, {
          signal: abortController.signal,
        });
        if (!response.success) {
          throw response;
        }
        setVod(response.data as unknown as VOD);
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          console.error(e);
        }
      }
    };
    fetchVod();
    return () => {
      abortController.abort();
    };
  }, [vodId, channel]);

  useEffect(() => {
    console.info(`Chat Delay: ${userChatDelay + delay} seconds`);
    return;
  }, [userChatDelay, delay]);

  useEffect(() => {
    if (!vodId) return;

    const search = new URLSearchParams(location.search);
    const timestampQuery = search.get('t');
    const timestampValue = timestampQuery !== null ? convertTimestamp(timestampQuery) : 0;
    if (timestampValue > 0) {
      setTimestamp(timestampValue);
    } else {
      const savedPosition = getResumePosition(vodId);
      if (savedPosition !== null && savedPosition > 0) {
        console.info(`Resuming Playback from ${savedPosition}`);
        setTimestamp(savedPosition);
      }
    }
  }, [vodId, location.search]);

  useEffect(() => {
    if (playerState === -1 || !vodId || !playerRef.current) return;

    switch (playerState) {
      case 0:
        clearResumePosition(vodId, 'vod_');
        break;
      case 2:
        const currentTime = playerRef.current.currentTime;
        if (currentTime !== null && currentTime > 0) saveResumePosition(vodId, currentTime, 'vod_');
        break;
      default:
        break;
    }
    return;
  }, [playerState, vodId, playerRef]);

  if (vod === undefined) return <Loading logo={logo} />;

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col">
      <div className={`flex flex-1 ${isPortrait ? 'flex-col' : 'flex-row'} min-h-0 min-w-0 overflow-hidden`}>
        {/* Left Column - Scrollable */}
        <div
          className={`flex min-w-0 [scrollbar-width:none] flex-col overflow-x-hidden overflow-y-auto [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${isPortrait ? 'w-full flex-shrink-0' : 'flex-1'}`}
        >
          {/* BaseVod strictly set to 100% height of parent to fill the initial viewport */}
          <div className="flex h-full w-full shrink-0 flex-col">
            <BaseVod
              {...props}
              logo={logo}
              playerRef={playerRef}
              vod={vod}
              timestamp={timestamp}
              setTimestamp={setTimestamp}
              setDelay={setDelay}
              setPlayerState={setPlayerState}
              cdnBase={cdnBase}
              type={props.type}
              isPortrait={isPortrait}
            />
          </div>
          {!isPortrait && tenantData && (
            <>
              <div className="w-full shrink-0">
                <PlayerTenantProfile tenantData={tenantData} />
              </div>
              {vod && (
                <RecentItemsVods
                  currentId={vod.id}
                  prev={vod.prev}
                  next={vod.next}
                  currentVod={{
                    id: vod.id,
                    platform: vod.platform,
                    platform_vod_id: vod.platform_vod_id,
                    title: vod.title,
                    duration: vod.duration,
                    created_at: vod.created_at,
                    thumbnail_url: vod.vod_uploads?.[0]?.thumbnail_url || null,
                    chapters: vod.chapters,
                  }}
                />
              )}
            </>
          )}
        </div>

        {isPortrait && <hr className="shrink-0 border-[#222230]" />}
        {!isPortrait && <div className="w-px shrink-0 bg-[#222230]" />}

        <Chat
          isPortrait={isPortrait}
          vodId={vodId!}
          playerRef={playerRef}
          delay={delay}
          userChatDelay={userChatDelay}
          setUserChatDelay={setUserChatDelay}
          isYoutubeVod={false}
          playerState={playerState}
          twitchId={twitchId}
        />
      </div>
    </div>
  );
}
