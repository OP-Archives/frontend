import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TwitchIcon, KickIcon } from '@/assets/icons';
import CustomWidthTooltip from '@/components/ui/CustomToolTip';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useScrollCarousel } from '@/hooks/useScrollCarousel';
import { cardHover } from '@/motion/variants';
import type { RecentVod, VodListItem } from '@/types';
import { toHHMMSS, getImage } from '@/utils/helpers';
import ChaptersMenu from '@/vods/ChaptersMenu';

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

interface RecentVodsCarouselProps {
  recentVods: RecentVod[];
  isLoading: boolean;
}

const getVodRouteType = (vod: RecentVod) => {
  if (vod.games?.length > 0) return 'games';
  if (vod.vod_uploads?.length > 0) return 'youtube';
  return 'manual';
};

const getVodLink = (vod: RecentVod) => {
  if (vod.is_live) return '';
  if (vod.vod_uploads?.length > 0) return `/${vod.tenantId}/youtube/${vod.id}`;
  if (vod.games?.length > 0) return `/${vod.tenantId}/games/${vod.id}`;
  return `/${vod.tenantId}/manual/${vod.id}`;
};

const getThumbnail = (vod: RecentVod) => {
  return vod.vod_uploads?.[0]?.thumbnail_url || vod.games?.[0]?.thumbnail_url || '';
};

function SkeletonCard() {
  return (
    <div className="min-w-0 flex-[0_0_100%] sm:flex-[0_0_calc((100%-8px)/2)] md:flex-[0_0_calc((100%-16px)/3)] lg:flex-[0_0_calc((100%-32px)/4)]">
      <div className="mb-2 block w-full min-w-0">
        <div className="aspect-video w-full animate-pulse rounded-md bg-[#222230]" />
        <div className="mt-2.5 mb-1 flex items-center gap-2.5 px-0.5">
          <div className="min-w-0 flex-1">
            <div className="h-3 w-16 animate-pulse rounded bg-[#222230]" />
            <div className="mt-1 h-4 w-3/4 animate-pulse rounded bg-[#222230]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function RecentVodsCarousel({ recentVods, isLoading }: RecentVodsCarouselProps) {
  const isSmall = useMediaQuery('(min-width: 640px)');
  const isMedium = useMediaQuery('(min-width: 768px)');
  const isLarge = useMediaQuery('(min-width: 1024px)');
  const visibleCount = isLarge ? 4 : isMedium ? 3 : isSmall ? 2 : 1;

  const { showLeft, showRight, visibleItems, scrollBy, containerRef } = useScrollCarousel({
    itemCount: recentVods.length,
    visibleCount,
  });

  if (isLoading) {
    return (
      <div>
        <div className="rounded-lg border border-[#222230] bg-[#16161e] p-4">
          <h3 className="mb-4 text-sm font-semibold text-[#9ca3af] uppercase">Recent VODs</h3>
          <div className="relative">
            <div className="flex [scrollbar-width:none] gap-2 overflow-x-auto [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!recentVods || recentVods.length === 0) return null;

  return (
    <div>
      <div className="rounded-lg border border-[#222230] bg-[#16161e] p-4">
        <h3 className="mb-4 text-sm font-semibold text-[#9ca3af] uppercase">Recent VODs</h3>
        <div className="relative">
          {showLeft && (
            <button
              type="button"
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
            {visibleItems(recentVods).map((vod) => {
              const link = getVodLink(vod);
              const thumbnail = getThumbnail(vod);
              const chapterCount = vod.chapters?.length ?? 0;

              const vodListItem: VodListItem = {
                id: vod.id,
                title: vod.title,
                created_at: vod.created_at,
                duration: vod.duration,
                platform: vod.platform,
                is_live: vod.is_live,
                thumbnail_url: vod.vod_uploads?.[0]?.thumbnail_url,
                chapters: vod.chapters.map((c) => ({
                  name: c.name,
                  image: c.image,
                  start: c.start,
                  duration: c.duration,
                  end: c.end,
                })),
                vod_uploads: vod.vod_uploads.map((u) => ({ thumbnail_url: u.thumbnail_url })),
                games: vod.games.map((g) => ({ thumbnail_url: g.thumbnail_url })),
              };

              return (
                <div
                  key={vod.id}
                  className="min-w-0 flex-[0_0_100%] sm:flex-[0_0_calc((100%-8px)/2)] md:flex-[0_0_calc((100%-16px)/3)] lg:flex-[0_0_calc((100%-32px)/4)]"
                >
                  <div className="mb-2 block w-full min-w-0">
                    <motion.div
                      className="group relative flex aspect-video w-full overflow-hidden rounded-md bg-[#6366f1] shadow-[0_8px_20px_rgba(99,102,241,0)]"
                      variants={cardHover}
                      initial="initial"
                      whileHover="whileHover"
                      whileTap="whileTap"
                    >
                      <motion.div
                        className="absolute inset-0 overflow-hidden rounded-md bg-[#222230]"
                        whileHover={{ x: -6, y: -6 }}
                      >
                        {link ? (
                          <Link to={link} className="absolute inset-0 block">
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
                              <div className="absolute inset-0 flex items-center justify-center text-sm text-[#9ca3af]">
                                ?
                              </div>
                            )}
                          </Link>
                        ) : thumbnail ? (
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
                        )}
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
                        {vod.platform && (
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
                            {DATE_FORMATTER.format(new Date(vod.created_at)).replace(',', '')}
                          </span>
                        </div>
                        <div className="absolute right-0 bottom-0">
                          <span className="bg-black/60 p-1.5 text-xs text-white">{toHHMMSS(vod.duration)}</span>
                        </div>
                      </motion.div>
                    </motion.div>
                    <div className="mt-2.5 mb-1 flex items-center gap-2.5 px-0.5">
                      {chapterCount > 0 && (
                        <div className="shrink-0 overflow-hidden rounded-sm ring-1 ring-[#222230]">
                          <img
                            src={getImage(vod.chapters?.[0]?.image, 40, 53)}
                            className="block h-[53px] w-[40px] object-cover"
                            alt={vod.chapters?.[0]?.name || 'Category'}
                            loading="lazy"
                          />
                        </div>
                      )}

                      <div className="flex min-w-0 flex-1 flex-col justify-center">
                        <div className="mb-0.5">
                          <Link
                            to={`/${vod.tenantId}`}
                            className="truncate text-xs font-semibold text-[#6366f1] transition-colors hover:text-[#6366f1]/80 hover:underline"
                          >
                            {vod.displayName}
                          </Link>
                        </div>
                        <div className="w-full min-w-0">
                          {link ? (
                            <Link to={link}>
                              <CustomWidthTooltip title={vod.title}>
                                <span className="truncate text-sm font-medium text-[#f0f0f5] transition-colors hover:text-[#6366f1]/80">
                                  {vod.title}
                                </span>
                              </CustomWidthTooltip>
                            </Link>
                          ) : (
                            <CustomWidthTooltip title={vod.title}>
                              <span className="truncate text-sm font-medium text-[#f0f0f5]">{vod.title}</span>
                            </CustomWidthTooltip>
                          )}
                        </div>

                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          {chapterCount > 0 && (
                            <ChaptersMenu vod={vodListItem} tenant={vod.tenantId} routeType={getVodRouteType(vod)} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {showRight && (
            <button
              type="button"
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
