import { Link, useParams } from 'react-router-dom';
import ChaptersMenu from './ChaptersMenu';
import WatchMenu from './WatchMenu';
import { TwitchIcon, KickIcon } from '@/assets/icons';
import CustomWidthTooltip from '@/components/ui/CustomToolTip';
import { useTenantContext } from '@/contexts/TenantContext';
import type { VodData } from '@/types';
import { toHHMMSS } from '@/utils/helpers';

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const getVodLink = (vod: VodData, tenant: string) => {
  if (vod.vod_uploads?.length > 0) return `/${tenant}/vods/${vod.id}`;
  if (vod.games?.length > 0) return `/${tenant}/games/${vod.id}`;
  return `/${tenant}/manual/${vod.id}`;
};

const getThumbnail = (vod: VodData) => {
  return vod.vod_uploads?.[0]?.thumbnail_url || vod.games?.[0]?.thumbnail_url || vod.thumbnail_url || '';
};

export default function VodCard({ vod, priority }: { vod: VodData; priority?: boolean }) {
  const { tenant: tenantParam } = useParams<{ tenant: string }>() as { tenant: string };
  const { cdnEnabled } = useTenantContext();
  const DEFAULT_VOD = getVodLink(vod, tenantParam);
  const DEFAULT_THUMBNAIL = getThumbnail(vod);

  const chapterCount = vod.chapters?.length ?? 0;

  return (
    <div className="mb-2 block w-full min-w-0">
      <div className="group relative flex aspect-video w-full overflow-hidden rounded-md bg-[#6366f1] transition-shadow duration-200 hover:shadow-[0_8px_20px_rgba(99,102,241,0.25)]">
        <div className="absolute inset-0 overflow-hidden rounded-md bg-[#222230] transition-all duration-200 ease-out group-hover:-translate-x-1.5 group-hover:-translate-y-1.5 group-hover:shadow-[8px_8px_24px_rgba(0,0,0,0.6)]">
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
          <div className="shadow-glow pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
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
        </div>
      </div>
      <div className="mt-1 mb-1 flex cursor-default items-center">
        {chapterCount > 0 && (
          <div className="mr-2 shrink-0">
            <ChaptersMenu vod={vod} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <Link to={DEFAULT_VOD} className="inline-flex max-w-full min-w-0 no-underline">
            <CustomWidthTooltip title={vod.title}>
              <span className="truncate text-xs font-medium text-[#6366f1] hover:text-[#6366f1]/80">{vod.title}</span>
            </CustomWidthTooltip>
          </Link>
          <div className="mt-1 flex justify-center">
            <WatchMenu vod={vod} cdnEnabled={cdnEnabled} />
          </div>
        </div>
      </div>
    </div>
  );
}
