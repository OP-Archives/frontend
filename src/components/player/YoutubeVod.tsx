import { useEffect, useRef, useState, ChangeEvent } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import BaseVod from './BaseVod';
import { PlayerLayout } from './PlayerLayout';
import { RecentItemsVods } from '@/components/player/RecentItems';
import { usePlayerLayout } from '@/components/player/usePlayerLayout';
import Loading from '@/components/ui/Loading';
import { NotFound } from '@/components/ui/NotFound';
import { useTenantContext } from '@/contexts/TenantContext';
import type { VodDetail, VODUpload, PartInfo, PlayerState } from '@/types';
import { archiveClient } from '@/utils/archive-client';
import { convertTimestamp } from '@/utils/helpers';
import { getResumePosition, saveResumePosition, clearResumePosition } from '@/utils/positionStorage';

export interface YoutubeVodProps {
  type?: string;
  logo?: string;
  twitchId?: number;
  origin?: string;
}

export default function YoutubeVod(props: YoutubeVodProps) {
  const { type, logo = '', twitchId, origin } = props;
  const location = useLocation();
  const params = useParams<{ vodId: string; tenant: string }>();
  const { vodId = '', tenant = '' } = params;
  const channel = tenant;
  const { tenant: tenantData } = useTenantContext();
  const [vod, setVod] = useState<VodDetail | undefined>(undefined);
  const [youtube, setYoutube] = useState<VODUpload[] | undefined>(undefined);
  const [part, setPart] = useState<PartInfo | null>(null);
  const [delay, setDelay] = useState<number | undefined>(undefined);
  const [userChatDelay, setUserChatDelay] = useState(0);
  const [playerState, setPlayerState] = useState<PlayerState>(-1);
  const playerRef = useRef<HTMLVideoElement | null>(null);

  const { isPortrait, chatOnLeft, setChatOnLeft } = usePlayerLayout(vodId);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchVod = async () => {
      try {
        const response = await archiveClient.vods.get(channel, vodId!, {
          signal: abortController.signal,
        });
        if (!response.success) {
          throw response;
        }
        const data = response.data;
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
      const savedPosition = getResumePosition(vodId, 'vod_', tenant);
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

  const lastSaveRef = useRef<number>(0);

  useEffect(() => {
    if (playerState === -1 || !vodId || !playerRef.current || !youtube || !part) return;

    switch (playerState) {
      case 0:
        if (part.part === youtube.length) {
          clearResumePosition(vodId, 'vod_', tenant);
        }
        break;
      case 2:
        const ytP = playerRef.current as { getCurrentTime?(): number } | null | undefined;
        let pauseTime = ytP?.getCurrentTime?.() ?? 0;
        if (pauseTime > 0) {
          if (youtube) {
            for (const video of youtube) {
              if ((video.part ?? 0) >= part.part) break;
              pauseTime += video.duration ?? 0;
            }
          }
          saveResumePosition(vodId, pauseTime, 'vod_', tenant);
        }
        break;
      default:
        break;
    }
    return;
  }, [playerState, vodId, playerRef, youtube, part]);

  useEffect(() => {
    if (playerState !== 1 || !vodId || !playerRef.current || !youtube || !part) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastSaveRef.current > 10000) {
        const ytP = playerRef.current as { getCurrentTime?(): number } | null | undefined;
        let t = ytP?.getCurrentTime?.() ?? 0;
        if (t > 0 && youtube) {
          for (const video of youtube) {
            if ((video.part ?? 0) >= part.part) break;
            t += video.duration ?? 0;
          }
          saveResumePosition(vodId, t, 'vod_', tenant);
          lastSaveRef.current = now;
        }
      }
    }, 1000);

    // Save immediately on play
    const ytP = playerRef.current as { getCurrentTime?(): number } | null | undefined;
    let t = ytP?.getCurrentTime?.() ?? 0;
    if (t > 0 && youtube) {
      for (const video of youtube) {
        if ((video.part ?? 0) >= part.part) break;
        t += video.duration ?? 0;
      }
      saveResumePosition(vodId, t, 'vod_', tenant);
      lastSaveRef.current = Date.now();
    }

    return () => clearInterval(interval);
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
    <PlayerLayout
      isPortrait={isPortrait}
      chatOnLeft={chatOnLeft}
      setChatOnLeft={setChatOnLeft}
      tenantData={tenantData}
      playerElement={
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
          tenant={tenant}
        />
      }
      chatProps={{
        isPortrait,
        vodId: vodId!,
        playerRef,
        delay,
        userChatDelay,
        youtube,
        part: part ?? null,
        setPart,
        setUserChatDelay,
        playerState,
        isYoutubeVod: true,
        platform: vod?.platform,
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
