import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import VodGamesMenu from './VodGamesMenu';
import { TwitchIcon, KickIcon } from '@/assets/icons';
import CustomWidthTooltip from '@/components/ui/CustomToolTip';
import { useScrollCarousel } from '@/hooks/useScrollCarousel';
import { useTypedParams } from '@/hooks/useTypedParams';
import { cardHover } from '@/motion/variants';
import type { VODNavigation, GameEntry, VodListItem, PartInfo } from '@/types';
import { toHHMMSS, getImage } from '@/utils/helpers';
import ChaptersMenu from '@/vods/ChaptersMenu';

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

interface RecentItemsVodsProps {
  currentId: number;
  prev: VODNavigation[] | undefined;
  next: VODNavigation[] | undefined;
  currentVod?: VODNavigation;
  hasGames?: boolean;
  isGamesRoute?: boolean;
}

interface RecentItemsGamesProps {
  games: GameEntry[];
  currentGameId: string;
  currentVodId: string;
  setPart?: (part: PartInfo) => void;
  prevVods?: VODNavigation[];
  nextVods?: VODNavigation[];
  currentVod?: VODNavigation;
}

function toVodListItem(item: VODNavigation): VodListItem {
  return {
    id: item.id,
    title: item.title || '',
    created_at: item.created_at || '',
    duration: item.duration || 0,
    platform: item.platform,
    is_live: item.is_live ?? false,
    thumbnail_url: item.thumbnail_url || '',
    chapters: (item.chapters || []).map((ch) => ({
      name: ch.name,
      image: ch.image,
      start: ch.start,
      duration: ch.duration,
      end: ch.end,
    })),
    vod_uploads: [],
    games: item.games || [],
  };
}

export function RecentItemsVods({ currentId, prev, next, currentVod, hasGames, isGamesRoute }: RecentItemsVodsProps) {
  const { tenant } = useTypedParams<{ tenant: string }>();
  const location = useLocation();

  const allItems = [...(prev || []), ...(next || []), ...(currentVod ? [currentVod] : [])]
    .filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i)
    .filter((v) => !hasGames || (v.games?.length ?? 0) > 0)
    .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());

  const { showLeft, showRight, visibleItems, scrollBy, containerRef } = useScrollCarousel({
    itemCount: allItems.length,
  });

  if (allItems.length <= 1) return null;

  return (
    <div>
      <div className="rounded-lg border border-[#222230] bg-[#16161e] p-4">
        <h3 className="mb-2 text-sm font-semibold text-[#9ca3af] uppercase">
          Related VODs &mdash;{' '}
          <Link
            to={`/${tenant}`}
            className="inline-flex items-center gap-1 text-[#6366f1] transition-colors hover:text-[#6366f1]/80"
          >
            View All
            <ExternalLink size={12} />
          </Link>
        </h3>
        <div className="relative">
          {showLeft && (
            <button
              onClick={() => scrollBy(-5)}
              className="absolute top-1/2 -left-2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#16161e]/90 text-[#9ca3af] shadow-lg transition-opacity hover:bg-[#16161e] hover:text-white"
            >
              <ChevronLeft size={16} />
            </button>
          )}
          <div
            ref={containerRef}
            className="flex [scrollbar-width:none] gap-2 overflow-x-auto [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {visibleItems(allItems).map((item) => (
              <div key={item.id} className="min-w-0 flex-[0_0_calc((100%-32px)/5)]">
                <div className="mb-2 block w-full min-w-0">
                  <motion.div
                    className={`group relative flex aspect-video w-full overflow-hidden rounded-md bg-[#6366f1] shadow-[0_8px_20px_rgba(99,102,241,0)] ${
                      item.id === currentId ? 'ring-2 ring-[#6366f1]' : ''
                    }`}
                    variants={cardHover}
                    initial="initial"
                    whileHover="whileHover"
                    whileTap="whileTap"
                  >
                    <motion.div
                      className="absolute inset-0 overflow-hidden rounded-md bg-[#222230]"
                      whileHover={{ x: -6, y: -6 }}
                    >
                      {(() => {
                        const thumbnail =
                          'vod_uploads' in item ? item.vod_uploads?.[0]?.thumbnail_url : item.thumbnail_url || '';
                        return thumbnail ? (
                          <img
                            className="thumbnail h-full w-full object-cover"
                            alt=""
                            src={thumbnail}
                            width={640}
                            height={360}
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-sm text-[#9ca3af]">
                            ?
                          </div>
                        );
                      })()}
                      {item.id === currentId || item.is_live ? null : (
                        <Link
                          to={location.pathname.replace(String(currentId), String(item.id))}
                          className="absolute inset-0 block"
                        />
                      )}
                      <motion.div
                        className="shadow-glow pointer-events-none absolute inset-0"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                      />
                      {item.is_live && (
                        <div className="absolute top-2 left-2 z-10">
                          <span className="inline-flex items-center gap-1.5 rounded bg-[#E40005]/90 px-2 py-0.5 text-[10px] font-bold text-white">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                            LIVE
                          </span>
                        </div>
                      )}
                      {(item.platform || '') && (
                        <div className="absolute top-2 right-2 z-10">
                          <span className="inline-flex items-center justify-center rounded bg-black/60 p-1 backdrop-blur-sm">
                            {item.platform === 'twitch' ? (
                              <TwitchIcon width={14} height={14} className="text-[#9146FF]" />
                            ) : item.platform === 'kick' ? (
                              <KickIcon width={14} height={14} className="text-[#53fc18]" />
                            ) : null}
                          </span>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0">
                        <span className="bg-black/60 p-1.5 text-xs text-white">
                          {DATE_FORMATTER.format(new Date(item.created_at || '')).replace(',', '')}
                        </span>
                      </div>
                      {(item.duration ?? 0) > 0 && (
                        <div className="absolute right-0 bottom-0">
                          <span className="bg-black/60 p-1.5 text-xs text-white">{toHHMMSS(item.duration ?? 0)}</span>
                        </div>
                      )}
                    </motion.div>
                  </motion.div>
                  <div className="mt-2 mb-1 flex cursor-default items-center gap-2.5 px-0.5">
                    {(item.chapters || []).length > 0 && (
                      <div className="shrink-0 overflow-hidden rounded-sm ring-1 ring-[#222230]">
                        <img
                          src={getImage(item.chapters?.[0]?.image, 40, 53)}
                          className="block h-[53px] w-[40px] object-cover"
                          alt="Category"
                          loading="lazy"
                        />
                      </div>
                    )}

                    <div className="flex min-w-0 flex-1 flex-col justify-center">
                      <div className="w-full min-w-0">
                        <Link to={location.pathname.replace(String(currentId), String(item.id))}>
                          <CustomWidthTooltip title={item.title || ''}>
                            <span className="truncate text-xs font-medium text-[#f0f0f5] transition-colors hover:text-[#6366f1]/80">
                              {item.title}
                            </span>
                          </CustomWidthTooltip>
                        </Link>
                      </div>
                      {isGamesRoute && item.games && item.games.length > 0 && (
                        <div className="mt-1.5 flex items-center">
                          <VodGamesMenu games={item.games!} vodId={item.id} is_live={item.is_live} />
                        </div>
                      )}
                      {!isGamesRoute && (item.chapters || []).length > 0 && (
                        <div className="mt-1.5 flex items-center">
                          <ChaptersMenu vod={toVodListItem(item)} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {showRight && (
            <button
              onClick={() => scrollBy(5)}
              className="absolute top-1/2 -right-2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#16161e]/90 text-[#9ca3af] shadow-lg transition-opacity hover:bg-[#16161e] hover:text-white"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function RecentItemsGames({
  games,
  currentGameId,
  currentVodId,
  setPart,
  prevVods,
  nextVods,
  currentVod,
}: RecentItemsGamesProps) {
  const navigateRef = useNavigate();
  const [searchParams] = useSearchParams();
  const currentGameIndex = games.findIndex((g) => parseInt(g.id) === parseInt(currentGameId));

  const { showLeft, showRight, visibleItems, scrollBy, containerRef } = useScrollCarousel({
    itemCount: games.length,
    initialOffset: Math.max(0, Math.min(currentGameIndex - 2, games.length - 5)),
    autoCenterIndex: currentGameIndex >= 0 ? currentGameIndex : undefined,
  });

  if (games.length === 0) return null;

  return (
    <div>
      <div className="rounded-lg border border-[#222230] bg-[#16161e] p-4">
        <h3 className="mb-2 text-sm font-semibold text-[#9ca3af] uppercase">Games in this VOD</h3>
        <div className="relative">
          {showLeft && (
            <button
              onClick={() => scrollBy(-5)}
              className="absolute top-1/2 -left-2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#16161e]/90 text-[#9ca3af] shadow-lg transition-opacity hover:bg-[#16161e] hover:text-white"
            >
              <ChevronLeft size={16} />
            </button>
          )}
          <div
            ref={containerRef}
            className="flex [scrollbar-width:none] gap-2 overflow-x-auto [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {visibleItems(games).map((game, index) => {
              const isCurrent = (!currentGameId && index === 0) || parseInt(currentGameId) === parseInt(game.id);

              return (
                <div key={game.id} className="min-w-0 flex-[0_0_calc((100%-32px)/5)]">
                  <motion.div
                    className={`group relative aspect-video w-full rounded-md bg-[#6366f1] shadow-[0_8px_20px_rgba(99,102,241,0)] ${
                      isCurrent ? 'ring-2 ring-[#6366f1]' : ''
                    }`}
                    variants={cardHover}
                    initial="initial"
                    whileHover="whileHover"
                    whileTap="whileTap"
                  >
                    <motion.div
                      className="absolute inset-0 overflow-hidden rounded-md bg-[#222230]"
                      whileHover={{ x: -6, y: -6 }}
                    >
                      <button
                        type="button"
                        className="absolute inset-0 block"
                        onClick={() => {
                          if (setPart && !isCurrent) {
                            const gameIndex = games.findIndex((g) => g.id === game.id);
                            setPart!({ part: gameIndex + 1, timestamp: 0 });
                            const newParams = new URLSearchParams(searchParams);
                            newParams.set('game_id', game.id);
                            navigateRef(`?${newParams.toString()}`, { replace: true });
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }}
                      >
                        {game.thumbnail_url ? (
                          <img
                            className="thumbnail h-full w-full object-cover"
                            alt=""
                            src={game.thumbnail_url}
                            width={640}
                            height={360}
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-sm text-[#9ca3af]">
                            ?
                          </div>
                        )}
                      </button>
                      <motion.div
                        className="shadow-glow pointer-events-none absolute inset-0"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                      />
                      {game.duration && (
                        <div className="absolute right-0 bottom-0">
                          <span className="bg-black/60 p-1.5 text-xs text-white">{toHHMMSS(game.duration)}</span>
                        </div>
                      )}
                      {game.created_at && (
                        <div className="absolute bottom-0 left-0">
                          <span className="bg-black/60 p-1.5 text-xs text-white">
                            {DATE_FORMATTER.format(new Date(game.created_at)).replace(',', '')}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  </motion.div>
                  <div className="mt-1 mb-1 flex cursor-default items-start">
                    <div className="mr-2 shrink-0">
                      <img
                        alt=""
                        src={getImage(game.chapter_image, 40, 53, game.game_id)}
                        width={40}
                        height={53}
                        className="pointer-events-none h-[53px] w-[40px] shrink-0 object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CustomWidthTooltip title={game.title || game.game_name || ''}>
                        <span className="truncate text-xs font-medium text-[#6366f1]">
                          {game.title || game.game_name}
                        </span>
                      </CustomWidthTooltip>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {showRight && (
            <button
              onClick={() => scrollBy(5)}
              className="absolute top-1/2 -right-2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#16161e]/90 text-[#9ca3af] shadow-lg transition-opacity hover:bg-[#16161e] hover:text-white"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
      {((prevVods && prevVods.length > 0) || (nextVods && nextVods.length > 0)) && (
        <div>
          <RecentItemsVods
            currentId={parseInt(currentVodId)}
            prev={prevVods || []}
            next={nextVods || []}
            currentVod={currentVod}
            hasGames
            isGamesRoute={true}
          />
        </div>
      )}
    </div>
  );
}
