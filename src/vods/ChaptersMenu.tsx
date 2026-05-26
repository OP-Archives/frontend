import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropdown } from '@/hooks/useDropdown';
import { useTypedParams } from '@/hooks/useTypedParams';
import type { VodData, ChapterItem } from '@/types';
import { toHHMMSS, toHMS, getImage } from '@/utils/helpers';

interface ChaptersProps {
  vod: VodData;
}

const EMPTY_CHAPTERS: ChapterItem[] = [];

export default function ChaptersMenu({ vod }: ChaptersProps) {
  const { position, isOpen, close, toggle, setMenuRef } = useDropdown(400);
  const [expanded, setExpanded] = useState(false);
  const chaptersArray = vod.chapters || EMPTY_CHAPTERS;
  const visibleChapters = expanded ? chaptersArray : chaptersArray.slice(0, 15);
  const navigate = useNavigate();
  const { tenant: tenantParam } = useTypedParams<{ tenant: string }>();

  const DEFAULT_VOD =
    vod.vod_uploads.length > 0
      ? `/${tenantParam}/vods/${vod.id}`
      : vod.games.length > 0
        ? `/${tenantParam}/games/${vod.id}`
        : `/${tenantParam}/manual/${vod.id}`;

  return (
    <div className="relative">
      <button
        onMouseDown={(e) => {
          e.stopPropagation();
          toggle(e.currentTarget);
        }}
        className="block cursor-pointer"
      >
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
      {isOpen && (
        <div
          ref={setMenuRef}
          className="fixed z-50 max-h-[400px] overflow-y-auto overscroll-contain rounded border border-[#222230] bg-[#16161e] shadow-xl"
          style={{
            ...(position.top !== undefined ? { top: position.top } : {}),
            ...(position.bottom !== undefined ? { bottom: position.bottom } : {}),
            ...(position.left !== undefined ? { left: position.left } : {}),
            ...(position.right !== undefined ? { right: position.right } : {}),
            width: 'max-content',
            maxWidth: '200px',
          }}
        >
          {visibleChapters.map((data) => (
            <a
              key={`${vod.id}${data?.game_id}${data?.start}`}
              href={`${DEFAULT_VOD}?t=${toHMS(data?.start as number)}`}
              onClick={() => {
                close();
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
