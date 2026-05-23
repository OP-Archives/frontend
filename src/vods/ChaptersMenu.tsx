import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { VodData, ChapterItem } from '@/types';
import { toHHMMSS, toHMS, getImage } from '@/utils/helpers';

interface ChaptersProps {
  vod: VodData;
}

const EMPTY_CHAPTERS: ChapterItem[] = [];

export default function ChaptersMenu({ vod }: ChaptersProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [coords, setCoords] = useState<{
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    maxWidth?: number;
  }>({});
  const [expanded, setExpanded] = useState(false);
  const chaptersArray = vod.chapters || EMPTY_CHAPTERS;
  const visibleChapters = expanded ? chaptersArray : chaptersArray.slice(0, 15);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { tenant: tenantParam } = useParams<{ tenant: string }>() as { tenant: string };

  const DEFAULT_VOD =
    vod.vod_uploads.length > 0
      ? `/${tenantParam}/vods/${vod.id}`
      : vod.games.length > 0
        ? `/${tenantParam}/games/${vod.id}`
        : `/${tenantParam}/manual/${vod.id}`;

  useEffect(() => {
    if (!anchorEl) {
      setExpanded(false);
      return;
    }

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

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (anchorEl) {
      setAnchorEl(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const menuMaxHeight = 400;
      const spaceBelow = window.innerHeight - rect.bottom;

      if (spaceBelow < menuMaxHeight && rect.top > spaceBelow) {
        setCoords({
          bottom: window.innerHeight - rect.top + 8,
          left: rect.left,
          maxWidth: window.innerWidth - rect.left - 16,
        });
      } else {
        setCoords({
          top: rect.bottom + 8,
          left: rect.left,
          maxWidth: window.innerWidth - rect.left - 16,
        });
      }
      setAnchorEl(e.currentTarget);
    }
  };

  return (
    <div className="relative">
      <button onMouseDown={(e) => e.stopPropagation()} onClick={handleClick} className="block cursor-pointer">
        <img
          alt=""
          src={getImage(vod.chapters?.[0]?.image)}
          width={40}
          height={53}
          className="h-[53px] w-[40px] object-cover"
          loading="lazy"
          decoding="async"
        />
      </button>
      {anchorEl && (
        <div
          ref={menuRef}
          className="fixed z-50 max-h-[400px] overflow-y-auto overscroll-contain rounded border border-[#222230] bg-[#16161e] shadow-xl"
          style={{
            ...(coords.top !== undefined ? { top: coords.top } : {}),
            ...(coords.bottom !== undefined ? { bottom: coords.bottom } : {}),
            ...(coords.left !== undefined ? { left: coords.left } : {}),
            ...(coords.right !== undefined ? { right: coords.right } : {}),
            width: 'max-content',
            maxWidth: '200px',
          }}
        >
          {visibleChapters.map((data) => (
            <a
              key={`${vod.id}${data?.game_id}${data?.start}`}
              href={`${DEFAULT_VOD}?t=${toHMS(data?.start as number)}`}
              onClick={() => {
                handleClose();
                navigate(`${DEFAULT_VOD}?t=${toHMS(data?.start as number)}`);
              }}
              className="flex cursor-pointer items-start border-b border-[#222230] px-3 py-2 transition-colors last:border-0 hover:bg-[#222230]"
            >
              <div className="mr-2 shrink-0">
                <img
                  alt=""
                  src={getImage(data.image)}
                  width={40}
                  height={53}
                  className="h-[53px] w-[40px] object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="text-sm leading-snug break-words whitespace-normal text-[#6366f1]">{data.name}</span>
                {data.end !== undefined && data.duration !== undefined && (
                  <span className="mt-0.5 text-xs text-[#9ca3af]">{toHHMMSS(data.duration)}</span>
                )}
              </div>
            </a>
          ))}

          {!expanded && chaptersArray.length > 15 && (
            <button
              onClick={() => setExpanded(true)}
              className="block w-full cursor-pointer bg-[#0c0c14] py-2 text-center text-xs font-semibold text-[#6366f1] transition-colors hover:bg-[#16161e]"
            >
              {`Show ${chaptersArray.length - 15} More Chapters...`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
