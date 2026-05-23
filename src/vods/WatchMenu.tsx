import { Play, Film, FilePlay } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { YouTubeIcon } from '@/assets/icons';
import type { VodData } from '@/types';

interface WatchMenuProps {
  vod: VodData;
  cdnEnabled: boolean;
}

export default function WatchMenu({ vod, cdnEnabled }: WatchMenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!anchorEl) return;

    const handleOutsideInteraction = (e: Event) => {
      if (e instanceof KeyboardEvent && e.key === 'Escape') {
        setAnchorEl(null);
        return;
      }

      if (menuRef.current && menuRef.current.contains(e.target as Node)) {
        return;
      }

      if (e.type !== 'keydown') {
        setAnchorEl(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideInteraction);
    document.addEventListener('wheel', handleOutsideInteraction, { capture: true, passive: true });
    document.addEventListener('touchmove', handleOutsideInteraction, {
      capture: true,
      passive: true,
    });
    document.addEventListener('keydown', handleOutsideInteraction);

    return () => {
      document.removeEventListener('mousedown', handleOutsideInteraction);
      document.removeEventListener('wheel', handleOutsideInteraction, { capture: true });
      document.removeEventListener('touchmove', handleOutsideInteraction, { capture: true });
      document.removeEventListener('keydown', handleOutsideInteraction);
    };
  }, [anchorEl]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (anchorEl) {
      setAnchorEl(null);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 4,
        left: rect.left,
      });
      setAnchorEl(event.currentTarget);
    }
  };

  const { tenant: tenantParam } = useParams<{ tenant: string }>() as { tenant: string };
  const isRecent = Date.now() - new Date(vod.created_at).getTime() <= 14 * 24 * 60 * 60 * 1000;
  const hasVodUploads = vod.vod_uploads.length > 0;

  const youtubeUrl = `/${tenantParam}/vods/${vod.id}`;
  const cdnUrl = cdnEnabled && isRecent ? `/${tenantParam}/cdn/${vod.id}` : null;
  const manualUrl = `/${tenantParam}/manual/${vod.id}`;
  const gamesUrl = vod.games.length !== 0 ? `/${tenantParam}/games/${vod.id}` : null;

  return (
    <>
      <button
        onMouseDown={(e) => e.stopPropagation()}
        onClick={handleClick}
        className="flex cursor-pointer items-center gap-1 rounded border border-[#6366f1] px-3 py-1 text-[13px] font-medium text-[#6366f1] transition-colors hover:bg-[#6366f1]/10"
      >
        <Play size={14} /> Watch
      </button>
      {anchorEl && (
        <div
          ref={menuRef}
          className="fixed z-50 w-max rounded border border-[#222230] bg-[#16161e] shadow-xl"
          style={{ left: coords.left, top: coords.top }}
        >
          <div className="p-1">
            <a
              href={hasVodUploads ? youtubeUrl : undefined}
              onClick={(e) => {
                if (!hasVodUploads) {
                  e.preventDefault();
                  return;
                }
                setAnchorEl(null);
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
                  setAnchorEl(null);
                  navigate(cdnUrl);
                }}
                className={`flex w-full items-center gap-2 rounded px-3 py-2 text-left text-[#f0f0f5] transition-colors hover:bg-[#222230] ${hasVodUploads ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}`}
              >
                <Film size={20} /> CDN
              </a>
            )}
            <a
              href={manualUrl}
              onClick={() => {
                setAnchorEl(null);
                navigate(manualUrl);
              }}
              className="flex w-full cursor-pointer items-center gap-2 rounded px-3 py-2 text-left text-[#f0f0f5] transition-colors hover:bg-[#222230]"
            >
              <FilePlay size={20} /> Manual
            </a>
            {gamesUrl && (
              <a
                href={gamesUrl}
                onClick={() => {
                  setAnchorEl(null);
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
