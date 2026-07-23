import { motion } from 'framer-motion';
import React from 'react';
import { Link } from 'react-router-dom';
import ChaptersMenu from './ChaptersMenu';
import WatchMenu from './WatchMenu';
import { TwitchIcon, KickIcon } from '@/assets/icons';
import CustomWidthTooltip from '@/components/ui/CustomToolTip';
import { useTenantContext } from '@/contexts/TenantContext';
import { useTypedParams } from '@/hooks/useTypedParams';
import { cardHover } from '@/motion/variants';
import type { VodListItem } from '@/types';
import { toHHMMSS, getImage } from '@/utils/helpers';

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const getThumbnail = (vod: VodListItem) => {
  return vod.vod_uploads?.[0]?.thumbnail_url || vod.games?.[0]?.thumbnail_url || vod.thumbnail_url || '';
};

const VodCard = React.memo(function VodCard({ vod, priority }: { vod: VodListItem; priority?: boolean }) {
  const { tenant: tenantParam } = useTypedParams<{ tenant: string }>();
  const { cdnEnabled } = useTenantContext();
  const isRecent = Date.now() - new Date(vod.created_at).getTime() <= 14 * 24 * 60 * 60 * 1000;

  let defaultRoute = 'manual';
  if (!vod.is_live) {
    if (vod.vod_uploads?.length > 0) {
      defaultRoute = 'youtube';
    } else if (cdnEnabled && isRecent) {
      defaultRoute = 'cdn';
    } else if (vod.games?.length > 0) {
      defaultRoute = 'games';
    }
  }
  const DEFAULT_VOD = vod.is_live ? '' : `/${tenantParam}/${defaultRoute}/${vod.id}`;
  const DEFAULT_THUMBNAIL = getThumbnail(vod);

  const chapterCount = vod.chapters?.length ?? 0;

  return (
    <div className="mb-2 block w-full min-w-0">
      <div className="overflow-visible rounded-md border border-transparent bg-[#16161e]/80 p-3 transition-all hover:border-[#222230] hover:bg-[#16161e]">
        <motion.div
          className="group relative flex aspect-video w-full overflow-hidden bg-[#6366f1] shadow-[0_8px_20px_rgba(99,102,241,0)]"
          variants={cardHover}
          initial="initial"
          whileHover="whileHover"
          whileTap="whileTap"
        >
          <motion.div
            className="absolute inset-0 overflow-hidden rounded-md bg-[#222230]"
            whileHover={{ x: -6, y: -6 }}
          >
            {DEFAULT_VOD ? (
              <Link to={DEFAULT_VOD} className="absolute inset-0 block">
                {DEFAULT_THUMBNAIL ? (
                  <img
                    className="thumbnail h-full w-full object-cover"
                    alt=""
                    src={DEFAULT_THUMBNAIL}
                    width={640}
                    height={360}
                    loading={priority ? 'eager' : 'lazy'}
                    fetchPriority={priority ? 'high' : 'auto'}
                    decoding="async"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-[#9ca3af]">?</div>
                )}
              </Link>
            ) : DEFAULT_THUMBNAIL ? (
              <img
                className="thumbnail h-full w-full object-cover"
                alt=""
                src={DEFAULT_THUMBNAIL}
                width={640}
                height={360}
                loading={priority ? 'eager' : 'lazy'}
                fetchPriority={priority ? 'high' : 'auto'}
                decoding="async"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-[#9ca3af]">?</div>
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
            <div className="w-full min-w-0">
              {DEFAULT_VOD ? (
                <Link to={DEFAULT_VOD} className="inline-flex max-w-full min-w-0 no-underline">
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
              {chapterCount > 0 && <ChaptersMenu vod={vod} routeType={defaultRoute} />}

              <div className="ml-auto">
                <WatchMenu vod={vod} cdnEnabled={cdnEnabled} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default VodCard;
