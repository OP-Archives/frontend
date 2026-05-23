import { useEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import BaseVod from './BaseVod';
import Chat from './Chat/Chat';
import { convertTimestamp } from '@/components/player/utils/helpers';
import Loading from '@/components/player/utils/Loading';
import { getResumePosition, saveResumePosition, clearResumePosition } from '@/components/player/utils/positionStorage';
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
    <div className="h-full w-full">
      <div className={`flex ${isPortrait ? 'flex-col' : 'flex-row'} h-full w-full min-w-0 overflow-hidden`}>
        <div className={`min-h-0 min-w-0 overflow-hidden ${isPortrait ? 'w-full flex-shrink-0' : 'h-full flex-1'}`}>
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
        {isPortrait && <hr className="border-[#222230]" />}
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
