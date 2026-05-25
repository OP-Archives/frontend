import { useEffect, useState, useRef, ChangeEvent } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import BaseVod from './BaseVod';
import Chat from './Chat/Chat';
import { PlayerTenantProfile } from '@/components/player/PlayerTenantProfile';
import { RecentItemsGames } from '@/components/player/RecentItems';
import Loading from '@/components/player/utils/Loading';
import { getResumePosition, saveResumePosition, clearResumePosition } from '@/components/player/utils/positionStorage';
import { safeLocalStorage } from '@/components/player/utils/safeLocalStorage';
import { useTenantContext } from '@/contexts/TenantContext';
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
  const { tenant: tenantData } = useTenantContext();
  const [vod, setVod] = useState<VOD | undefined>(undefined);
  const [games, setGames] = useState<GameEntry[] | undefined>(undefined);
  const [part, setPart] = useState<PartInfo | null | undefined>(undefined);
  const [userChatDelay, setUserChatDelay] = useState(0);
  const [chatOnLeft, setChatOnLeft] = useState(false);
  const [playerState, setPlayerState] = useState<PlayerState>(-1);
  const playerRef = useRef<HTMLVideoElement | null>(null);
  const [isPortrait, setIsPortrait] = useState(false);
  const navigate = useNavigate();
  const currentGameId = new URLSearchParams(location.search).get('game_id') || '';

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

  useEffect(() => {
    if (!part || !games || typeof part.part !== 'number' || part.part < 1) return;
    const currentGame = games[part.part - 1];
    if (!currentGame) return;
    navigate(`?game_id=${currentGame.id}`);
  }, [part?.part, games]);

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
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <div
        className={`flex ${isPortrait ? 'flex-col' : chatOnLeft ? 'flex-row-reverse' : 'flex-row'} h-full w-full min-w-0 overflow-hidden`}
      >
        {/* Left Column - Scrollable */}
        <div
          className={`flex min-w-0 [scrollbar-width:none] flex-col overflow-x-hidden overflow-y-auto [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${isPortrait ? 'w-full flex-shrink-0' : 'h-full flex-1'}`}
        >
          {/* BaseVod strictly set to 100% height of parent to fill the initial viewport */}
          <div className={`flex w-full shrink-0 flex-col ${isPortrait ? '' : 'h-full'}`}>
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
          {!isPortrait && tenantData && (
            <div className="theatre-hide flex w-full flex-col">
              <div className="w-full shrink-0">
                <PlayerTenantProfile tenantData={tenantData} />
              </div>
              <RecentItemsGames
                games={games}
                currentGameId={currentGameId}
                currentVodId={vodId!}
                setPart={setPart}
                prevVods={vod.prev}
                nextVods={vod.next}
                currentVod={vod}
              />
            </div>
          )}
        </div>

        {isPortrait && <hr className="shrink-0 border-[#222230]" />}
        {!isPortrait && <div className="w-px shrink-0 bg-[#222230]" />}

        <Chat
          isPortrait={isPortrait}
          vodId={vodId!}
          playerRef={playerRef}
          userChatDelay={userChatDelay}
          part={part ?? null}
          setPart={setPart}
          games={games}
          setUserChatDelay={setUserChatDelay}
          chatOnLeft={chatOnLeft}
          setChatOnLeft={setChatOnLeft}
          playerState={playerState}
          twitchId={twitchId}
        />
      </div>
    </div>
  );
}
