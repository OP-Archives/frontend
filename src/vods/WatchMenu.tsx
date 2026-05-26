import { Play, Film, FilePlay } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { YouTubeIcon } from '@/assets/icons';
import { useDropdown } from '@/hooks/useDropdown';
import { useTypedParams } from '@/hooks/useTypedParams';
import type { VodListItem } from '@/types';

interface WatchMenuProps {
  vod: VodListItem;
  cdnEnabled: boolean;
}

export default function WatchMenu({ vod, cdnEnabled }: WatchMenuProps) {
  const { position, isOpen, close, toggle, setMenuRef } = useDropdown();
  const navigate = useNavigate();

  const { tenant: tenantParam } = useTypedParams<{ tenant: string }>();
  const isRecent = Date.now() - new Date(vod.created_at).getTime() <= 14 * 24 * 60 * 60 * 1000;
  const hasVodUploads = vod.vod_uploads.length > 0;

  const youtubeUrl = `/${tenantParam}/vods/${vod.id}`;
  const cdnUrl = cdnEnabled && isRecent ? `/${tenantParam}/cdn/${vod.id}` : null;
  const manualUrl = `/${tenantParam}/manual/${vod.id}`;
  const gamesUrl = vod.games.length !== 0 ? `/${tenantParam}/games/${vod.id}` : null;

  return (
    <>
      <button
        onMouseDown={(e) => {
          e.stopPropagation();
          toggle(e.currentTarget);
        }}
        className="flex cursor-pointer items-center gap-1 rounded bg-[#6366f1] px-3 py-1 text-[13px] font-medium text-white transition-colors hover:bg-[#5558e6]"
      >
        <Play size={14} className="mt-0.5" /> Watch
      </button>
      {isOpen && (
        <div
          ref={setMenuRef}
          className="fixed z-50 w-max rounded border border-[#222230] bg-[#16161e] shadow-xl"
          style={{ left: position.left, top: position.top }}
        >
          <div className="p-1">
            <a
              href={hasVodUploads ? youtubeUrl : undefined}
              onClick={(e) => {
                if (!hasVodUploads) {
                  e.preventDefault();
                  return;
                }
                close();
                navigate(youtubeUrl);
              }}
              className={`flex w-full items-center gap-2 rounded px-3 py-2 text-left text-[#f0f0f5] transition-colors hover:bg-[#222230] ${hasVodUploads ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}`}
            >
              <YouTubeIcon width={20} height={20} /> Youtube
            </a>
            {cdnUrl && (
              <a
                href={cdnUrl}
                onClick={() => {
                  close();
                  navigate(cdnUrl);
                }}
                className={`flex w-full items-center gap-2 rounded px-3 py-2 text-left text-[#f0f0f5] transition-colors hover:bg-[#222230] ${hasVodUploads ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}`}
              >
                <Film size={20} /> CDN
              </a>
            )}
            <a
              href={vod.is_live ? undefined : manualUrl}
              onClick={(e) => {
                if (vod.is_live) {
                  e.preventDefault();
                  return;
                }
                close();
                navigate(manualUrl);
              }}
              className={`flex w-full items-center gap-2 rounded px-3 py-2 text-left text-[#f0f0f5] transition-colors hover:bg-[#222230] ${vod.is_live ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
            >
              <FilePlay size={20} /> Manual
            </a>
            {gamesUrl && (
              <a
                href={gamesUrl}
                onClick={() => {
                  close();
                  navigate(gamesUrl);
                }}
                className="flex w-full cursor-pointer items-center gap-2 rounded px-3 py-2 text-left text-[#f0f0f5] transition-colors hover:bg-[#222230]"
              >
                <YouTubeIcon className="h-5 w-5" /> Games
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}
