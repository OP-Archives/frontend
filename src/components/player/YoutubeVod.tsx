import { useEffect, useRef, useState, ChangeEvent } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import BaseVod from './BaseVod';
import Chat from './Chat/Chat';
import { PlayerTenantProfile } from '@/components/player/PlayerTenantProfile';
import { RecentItemsVods } from '@/components/player/RecentItems';
import { convertTimestamp } from '@/components/player/utils/helpers';
import Loading from '@/components/player/utils/Loading';
import { getResumePosition, saveResumePosition, clearResumePosition } from '@/components/player/utils/positionStorage';
import { safeLocalStorage } from '@/components/player/utils/safeLocalStorage';
import { useTenantContext } from '@/contexts/TenantContext';
import type { VOD, VODUpload, PartInfo, PlayerState } from '@/types';
import { archiveClient } from '@/utils/archive-client';
import { NotFound } from '@/utils/NotFound';

export interface YoutubeVodProps {
  type?: string;
  logo?: string;
  twitchId?: number;
  origin?: string;
}

export default function YoutubeVod(props: YoutubeVodProps) {
  const { type, logo = '', twitchId, origin } = props;
  const location = useLocation();
  const { vodId, tenant } = useParams<{ vodId: string; tenant: string }>();
  const channel = tenant || '';
  const { tenant: tenantData } = useTenantContext();
  const [vod, setVod] = useState<VOD | undefined>(undefined);
  const [youtube, setYoutube] = useState<VODUpload[] | undefined>(undefined);
  const [part, setPart] = useState<PartInfo | null>(null);
  const [delay, setDelay] = useState<number | undefined>(undefined);
  const [userChatDelay, setUserChatDelay] = useState(0);
  const [chatOnLeft, setChatOnLeft] = useState(false);
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
    const savedSettings = safeLocalStorage.getItem('chatSettings');
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
        const data = response.data as unknown as VOD;
        setVod(data);
        if (!type) {
          const useType = data.vod_uploads.some((upload: VODUpload) => upload.type === 'live') ? 'live' : 'vod';
          setYoutube(data.vod_uploads.filter((upload: VODUpload) => upload.type === useType));
        } else {
          setYoutube(data.vod_uploads.filter((upload: VODUpload) => upload.type === type));
        }
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
  }, [vodId, type, channel]);

  useEffect(() => {
    if (!youtube || !vodId) return;

    const search = new URLSearchParams(location.search);
    const timestampQuery = search.get('t');
    let timestamp = timestampQuery !== null ? convertTimestamp(timestampQuery) : 0;
    const partQuery = search.get('part');
    let tmpPart = partQuery !== null ? parseInt(partQuery) : 1;
    if (timestamp === 0) {
      const savedPosition = getResumePosition(vodId);
      if (savedPosition !== null && savedPosition > 0) {
        console.info(`Resuming Playback from ${savedPosition}`);
        timestamp = savedPosition;
      }
    }
    for (const data of youtube) {
      if (data.duration !== null && data.duration > timestamp) {
        tmpPart = data.part ?? youtube.indexOf(data) + 1;
        break;
      }
      timestamp -= data.duration ?? 0;
    }
    setPart({ part: tmpPart, timestamp });
    return;
  }, [location.search, vodId, youtube]);

  useEffect(() => {
    if (!youtube || !vod) return;
    let totalYoutubeDuration = 0;
    for (const data of youtube) {
      if (!data.duration) {
        continue;
      }
      totalYoutubeDuration += data.duration;
    }
    const tmpDelay = Math.max(0, vod.duration - totalYoutubeDuration);
    setDelay(tmpDelay);
    return;
  }, [youtube, vod]);

  useEffect(() => {
    if (playerState === -1 || !vodId || !playerRef.current || !youtube || !part) return;

    switch (playerState) {
      case 0:
        if (part.part === youtube.length) {
          clearResumePosition(vodId, 'vod_');
        }
        break;
      case 2:
        const ytP = playerRef.current as { getCurrentTime?(): number } | null | undefined;
        let currentTime = ytP?.getCurrentTime?.() ?? 0;
        if (currentTime > 0) {
          if (youtube) {
            for (const video of youtube) {
              if ((video.part ?? 0) >= part.part) break;
              currentTime += video.duration ?? 0;
            }
          }
          saveResumePosition(vodId, currentTime, 'vod_');
        }
        break;
      default:
        break;
    }
    return;
  }, [playerState, vodId, playerRef, youtube, part]);

  const handlePartChange = (evt: ChangeEvent<HTMLSelectElement>) => {
    const tmpPart = Number(evt.target.value) + 1;
    setPart({ part: tmpPart, timestamp: 0 });
  };

  useEffect(() => {
    if (delay === undefined) return;
    console.info(`Chat Delay: ${userChatDelay + delay} seconds`);
  }, [userChatDelay, delay]);

  if (vod === undefined || !part || delay === undefined || youtube === undefined) return <Loading logo={logo} />;

  if (youtube.length === 0) return <NotFound />;

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col">
      <div
        className={`flex flex-1 ${isPortrait ? 'flex-col' : chatOnLeft ? 'flex-row-reverse' : 'flex-row'} min-h-0 min-w-0 overflow-hidden`}
      >
        {/* Left Column - Scrollable */}
        <div
          className={`flex min-w-0 [scrollbar-width:none] flex-col overflow-x-hidden overflow-y-auto [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${isPortrait ? 'w-full flex-shrink-0' : 'flex-1'}`}
        >
          {/* BaseVod strictly set to 100% height of parent to fill the initial viewport */}
          <div className="flex h-full w-full shrink-0 flex-col">
            <BaseVod
              {...props}
              logo={logo}
              handlePartChange={handlePartChange}
              youtube={youtube}
              isYoutubeVod={true}
              playerRef={playerRef}
              part={part}
              setPart={setPart}
              vod={vod}
              setPlayerState={setPlayerState}
              origin={origin}
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
          youtube={youtube}
          part={part}
          setPart={setPart}
          setUserChatDelay={setUserChatDelay}
          chatOnLeft={chatOnLeft}
          setChatOnLeft={setChatOnLeft}
          isYoutubeVod={true}
          playerState={playerState}
          twitchId={twitchId}
        />
      </div>
    </div>
  );
}
