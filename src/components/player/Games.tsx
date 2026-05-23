import { useEffect, useState, useRef, ChangeEvent } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import BaseVod from './BaseVod';
import Chat from './Chat/Chat';
import Loading from '@/components/player/utils/Loading';
import { getResumePosition, saveResumePosition, clearResumePosition } from '@/components/player/utils/positionStorage';
import type { VOD, GameEntry, PartInfo, PlayerState } from '@/types';
import { archiveClient } from '@/utils/archive-client';

export interface GamesProps {
  logo?: string;
  twitchId?: number;
  origin?: string;
}

export default function Games(props: GamesProps) {
  const { logo = '', twitchId } = props;
  const location = useLocation();
  const { vodId, tenant } = useParams<{ vodId: string; tenant: string }>();
  const channel = tenant || '';
  const [vod, setVod] = useState<VOD | undefined>(undefined);
  const [games, setGames] = useState<GameEntry[] | undefined>(undefined);
  const [part, setPart] = useState<PartInfo | null | undefined>(undefined);
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
    const savedPosition = getResumePosition(selectedGameId, 'game_');
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
        clearResumePosition(currentGame!.id, 'game_');
        break;
      case 2:
        const ytP = playerRef.current as { getCurrentTime?(): number } | null | undefined;
        const currentTime = ytP?.getCurrentTime?.() ?? 0;
        if (currentTime > 0) {
          saveResumePosition(currentGame!.id, currentTime, 'game_');
        }
        break;
      default:
        break;
    }
    return;
  }, [playerState, games, playerRef, part]);

  const handlePartChange = (evt: ChangeEvent<HTMLSelectElement>) => {
    const tmpPart = parseInt(evt.target.value) + 1;
    const selectedGameId = games![tmpPart - 1].id;
    const savedPosition = getResumePosition(selectedGameId, 'game_');
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
        <div className="flex gap-2">
          {vod.prev[0] && (
            <a
              href={`/games/${vod.prev[0].id}`}
              className="flex items-center gap-1 text-[#f0f0f5] transition-colors hover:text-[#6366f1]"
            >
              <span>Previous Game</span>
            </a>
          )}
          {vod.next[0] && (
            <a
              href={`/games/${vod.next[0].id}`}
              className="flex items-center gap-1 text-[#f0f0f5] transition-colors hover:text-[#6366f1]"
            >
              <span>Next Game</span>
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <div className={`flex ${isPortrait ? 'flex-col' : 'flex-row'} h-full w-full min-w-0 overflow-hidden`}>
        <div className={`min-h-0 min-w-0 overflow-hidden ${isPortrait ? 'w-full flex-shrink-0' : 'h-full flex-1'}`}>
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
          />
        </div>
        {isPortrait && <hr className="border-[#222230]" />}
        <Chat
          isPortrait={isPortrait}
          vodId={vodId!}
          playerRef={playerRef}
          userChatDelay={userChatDelay}
          part={part ?? null}
          setPart={setPart}
          games={games}
          setUserChatDelay={setUserChatDelay}
          playerState={playerState}
          twitchId={twitchId}
        />
      </div>
    </div>
  );
}
