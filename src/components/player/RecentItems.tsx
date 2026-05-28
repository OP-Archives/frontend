import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
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
    games: [],
  };
}

export function RecentVodCard({ vod, isCurrent }: { vod: VODNavigation; isCurrent: boolean }) {
  const { vodId } = useTypedParams<{ vodId: string }>();
  const location = useLocation();

  const getLink = (newId: number) => location.pathname.replace(String(vodId), String(newId));

  const vodData = toVodListItem(vod);
  const thumbnail = 'vod_uploads' in vod ? vod.vod_uploads?.[0]?.thumbnail_url : vod.thumbnail_url || '';

  return (
    <div className="mb-2 block w-full min-w-0">
      <motion.div
        className={`group relative flex aspect-video w-full overflow-hidden rounded-md bg-[#6366f1] shadow-[0_8px_20px_rgba(99,102,241,0)] ${
          isCurrent ? 'ring-2 ring-[#6366f1]' : ''
        }`}
        variants={cardHover}
        initial="initial"
        whileHover="whileHover"
        whileTap="whileTap"
      >
        <motion.div className="absolute inset-0 overflow-hidden rounded-md bg-[#222230]" whileHover={{ x: -6, y: -6 }}>
          {thumbnail ? (
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
            <div className="absolute inset-0 flex items-center justify-center text-sm text-[#9ca3af]">?</div>
          )}
          {isCurrent || vod.is_live ? null : <Link to={getLink(vod.id)} className="absolute inset-0 block" />}
          <motion.div
            className="shadow-glow pointer-events-none absolute inset-0"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
          />
          {vod.is_live && (
            <div className="absolute top-2 left-2 z-10">
              <span className="inline-flex items-center gap-1.5 rounded bg-[#E40005]/90 px-2 py-0.5 text-[10px] font-bold text-white">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                LIVE
              </span>
            </div>
          )}
          {(vod.platform || '') && (
            <div className="absolute top-2 right-2 z-10">
              <span className="inline-flex items-center justify-center rounded bg-black/60 p-1 backdrop-blur-sm">
                {vod.platform === 'twitch' ? (
                  <TwitchIcon width={14} height={14} className="text-[#9146FF]" />
                ) : vod.platform === 'kick' ? (
                  <KickIcon width={14} height={14} className="text-[#53fc18]" />
                ) : null}
              </span>
            </div>
          )}
          <div className="absolute bottom-0 left-0">
            <span className="bg-black/60 p-1.5 text-xs text-white">
              {DATE_FORMATTER.format(new Date(vod.created_at || '')).replace(',', '')}
            </span>
          </div>
          {(vod.duration ?? 0) > 0 && (
            <div className="absolute right-0 bottom-0">
              <span className="bg-black/60 p-1.5 text-xs text-white">{toHHMMSS(vod.duration ?? 0)}</span>
            </div>
          )}
        </motion.div>
      </motion.div>
      <div className="mt-1 mb-1 flex cursor-default items-start">
        {(vod.chapters || []).length > 0 && (
          <div className="mr-2 shrink-0">
            <ChaptersMenu vod={vodData} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          {isCurrent || vod.is_live ? (
            <span className="inline-flex max-w-full min-w-0 no-underline">
              <CustomWidthTooltip title={vod.title || ''}>
                <span className="truncate text-xs font-medium text-[#6366f1]">{vod.title}</span>
              </CustomWidthTooltip>
            </span>
          ) : (
            <Link to={getLink(vod.id)} className="inline-flex max-w-full min-w-0 no-underline">
              <CustomWidthTooltip title={vod.title || ''}>
                <span className="truncate text-xs font-medium text-[#6366f1] hover:text-[#6366f1]/80">{vod.title}</span>
              </CustomWidthTooltip>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export function RecentItemsVods({ currentId, prev, next, currentVod, hasGames }: RecentItemsVodsProps) {
  const { tenant } = useTypedParams<{ tenant: string }>();

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
                <RecentVodCard vod={item} isCurrent={item.id === currentId} />
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
                      <CustomWidthTooltip title={game.title || ''}>
                        <span className="truncate text-xs font-medium text-[#6366f1]">{game.title}</span>
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
          />
        </div>
      )}
    </div>
  );
}
