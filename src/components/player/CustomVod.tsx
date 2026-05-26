import { useEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import BaseVod from './BaseVod';
import { PlayerLayout } from './PlayerLayout';
import { RecentItemsVods } from '@/components/player/RecentItems';
import { usePlayerLayout } from '@/components/player/usePlayerLayout';
import Loading from '@/components/ui/Loading';
import { useTenantContext } from '@/contexts/TenantContext';
import type { VodDetail, PlayerState } from '@/types';
import { unwrap } from '@/utils/api';
import { archiveClient } from '@/utils/archive-client';
import { convertTimestamp } from '@/utils/helpers';
import { getResumePosition, saveResumePosition, clearResumePosition } from '@/utils/positionStorage';

export interface CustomVodProps {
  logo?: string;
  cdnBase?: string;
  type?: 'cdn' | 'manual';
  twitchId?: number;
}

export default function CustomVod(props: CustomVodProps) {
  const { logo = '', cdnBase, twitchId } = props;
  const location = useLocation();
  const params = useParams<{ vodId: string; tenant: string }>();
  const vodId = params.vodId ?? '';
  const tenant = params.tenant ?? '';
  const channel = tenant;
  const { tenant: tenantData } = useTenantContext();
  const [vod, setVod] = useState<VodDetail | undefined>(undefined);
  const [timestamp, setTimestamp] = useState<number | undefined>(undefined);
  const [delay, setDelay] = useState(0);
  const [userChatDelay, setUserChatDelay] = useState(0);
  const [playerState, setPlayerState] = useState<PlayerState>(-1);
  const playerRef = useRef<HTMLVideoElement | null>(null);

  const { isPortrait, chatOnLeft, setChatOnLeft } = usePlayerLayout(vodId);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchVod = async () => {
      try {
        const data = await unwrap(
          archiveClient.vods.get(channel, vodId!, {
            signal: abortController.signal,
          })
        );
        setVod(data);
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
      const savedPosition = getResumePosition(vodId, 'vod_', tenant);
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
        clearResumePosition(vodId, 'vod_', tenant);
        break;
      case 2:
        const currentTime = playerRef.current.currentTime;
        if (currentTime !== null && currentTime > 0) saveResumePosition(vodId, currentTime, 'vod_', tenant);
        break;
      default:
        break;
    }
    return;
  }, [playerState, vodId, playerRef]);

  if (vod === undefined) return <Loading logo={logo} />;

  return (
    <PlayerLayout
      isPortrait={isPortrait}
      chatOnLeft={chatOnLeft}
      setChatOnLeft={setChatOnLeft}
      tenantData={tenantData}
      playerElement={
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
          tenant={tenant}
        />
      }
      chatProps={{
        isPortrait,
        vodId: vodId!,
        playerRef,
        delay,
        userChatDelay,
        setUserChatDelay,
        playerState,
        twitchId,
        chatOnLeft,
        setChatOnLeft,
      }}
      recentItems={
        vod && (
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
              is_live: vod.is_live,
              chapters: vod.chapters,
            }}
          />
        )
      }
    />
  );
}
