import { useEffect, useState, useRef, ChangeEvent } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import BaseVod from './BaseVod';
import { PlayerLayout } from '@/components/player/PlayerLayout';
import { RecentItemsGames } from '@/components/player/RecentItems';
import { usePlayerLayout } from '@/components/player/usePlayerLayout';
import Loading from '@/components/ui/Loading';
import { useTenantContext } from '@/contexts/TenantContext';
import type { VodDetail, GameEntry, PartInfo, PlayerState } from '@/types';
import { unwrap } from '@/utils/api';
import { archiveClient } from '@/utils/archive-client';
import { getResumePosition, saveResumePosition, clearResumePosition } from '@/utils/positionStorage';
import { hasGetCurrentTime } from '@/utils/typeGuards';

export interface GamesProps {
  logo?: string;
  twitchId?: number;
  origin?: string;
}

export default function Games(props: GamesProps) {
  const { logo = '', twitchId } = props;
  const location = useLocation();
  const params = useParams<{ vodId: string; tenant: string }>();
  const { vodId = '', tenant = '' } = params;
  const channel = tenant;
  const { tenant: tenantData } = useTenantContext();
  const [vod, setVod] = useState<VodDetail | undefined>(undefined);
  const [games, setGames] = useState<GameEntry[] | undefined>(undefined);
  const [part, setPart] = useState<PartInfo | null | undefined>(undefined);
  const [userChatDelay, setUserChatDelay] = useState(0);
  const [playerState, setPlayerState] = useState<PlayerState>(-1);
  const playerRef = useRef<HTMLVideoElement | null>(null);
  const navigate = useNavigate();
  const currentGameId = new URLSearchParams(location.search).get('game_id') || '';

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
    if (!vod) return;
    setGames(vod.games);
    if (!vod.games || vod.games.length === 0) {
      setPart(null);
      return;
    }

    const search = new URLSearchParams(location.search);
    const game_id = search.get('game_id') !== null ? parseInt(search.get('game_id')!) : undefined;
    const index = vod.games.findIndex((game: GameEntry) => parseInt(game.id) === game_id);

    let savedTimestamp = 0;
    const selectedGameIndex = index === -1 ? 0 : index;
    const selectedGameId = vod.games[selectedGameIndex].id;
    const savedPosition = getResumePosition(selectedGameId, 'game_', tenant);
    if (savedPosition !== null) {
      savedTimestamp = savedPosition;
    }

    setPart({ part: index === -1 ? 1 : index + 1, timestamp: savedTimestamp });
    return;
  }, [vod, location.search]);

  useEffect(() => {
    if (playerState === -1 || !playerRef.current) return;

    const currentGame = games?.[part!.part - 1];

    switch (playerState) {
      case 0:
        clearResumePosition(currentGame!.id, 'game_', tenant);
        break;
      case 2:
        const currentTime = hasGetCurrentTime(playerRef.current) ? playerRef.current.getCurrentTime() : 0;
        if (currentTime > 0) {
          saveResumePosition(currentGame!.id, currentTime, 'game_', tenant);
        }
        break;
      default:
        break;
    }
    return;
  }, [playerState, games, playerRef, part]);

  useEffect(() => {
    if (!part || !games || typeof part.part !== 'number' || part.part < 1) return;
    const currentGame = games[part.part - 1];
    if (!currentGame) return;
    const search = new URLSearchParams(location.search);
    if (search.get('game_id') === currentGame.id) return;
    navigate(`?game_id=${currentGame.id}`, { replace: true });
  }, [part?.part, games, location.search]);

  const handlePartChange = (evt: ChangeEvent<HTMLSelectElement>) => {
    const tmpPart = parseInt(evt.target.value) + 1;
    const selectedGameId = games![tmpPart - 1].id;
    const savedPosition = getResumePosition(selectedGameId, 'game_', tenant);
    let savedTimestamp = 0;
    if (savedPosition !== null) {
      savedTimestamp = savedPosition;
    }
    setPart({ part: tmpPart, timestamp: savedTimestamp });
  };

  useEffect(() => {
    console.info(`Chat Delay: ${userChatDelay} seconds`);
    return;
  }, [userChatDelay]);

  if (vod === undefined) return <Loading logo={logo} />;

  if (!games || games.length === 0) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
        {logo && <img src={logo} alt="" className="h-auto max-w-[200px]" />}
        <p className="text-lg text-[#9ca3af]">No games found</p>
      </div>
    );
  }

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
          games={games}
          playerRef={playerRef}
          part={part}
          setPart={setPart}
          vod={vod}
          setPlayerState={setPlayerState}
          isPortrait={isPortrait}
          tenant={tenant}
        />
      }
      chatProps={{
        isPortrait,
        vodId: vodId!,
        playerRef,
        userChatDelay,
        part: part ?? null,
        setPart,
        games,
        setUserChatDelay,
        playerState,
        twitchId,
        chatOnLeft,
        setChatOnLeft,
      }}
      recentItems={
        games && (
          <RecentItemsGames
            games={games}
            currentGameId={currentGameId}
            currentVodId={vodId!}
            setPart={setPart}
            prevVods={vod.prev}
            nextVods={vod.next}
            currentVod={vod}
          />
        )
      }
    />
  );
}
