import humanize from 'humanize-duration';
import { List } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import type { GameEntry } from '@/types';
import { getImage } from '@/utils/helpers';

interface VodGamesMenuProps {
  games: GameEntry[];
  vodId: number;
  is_live?: boolean;
}

const EMPTY_GAMES: GameEntry[] = [];

export default function VodGamesMenu({ games, vodId, is_live }: VodGamesMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    maxHeight: number;
  }>({
    left: 0,
    maxHeight: 400,
  });
  const navigate = useNavigate();
  const location = useLocation();

  const gamesArray = games || EMPTY_GAMES;

  const routeType = location.pathname.match(/\/(youtube|vods|cdn|manual|games)\//)?.[1] ?? 'youtube';
  const DEFAULT_VOD = location.pathname.replace(/\/(youtube|vods|cdn|manual|games)\/\d+/, `/${routeType}/${vodId}`);

  const handleClose = () => {
    setMenuOpen(false);
  };

  const handleClick = () => {
    if (!menuOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;

      if (spaceBelow > spaceAbove) {
        setCoords({
          top: rect.bottom + 8,
          bottom: undefined,
          left: rect.left,
          maxHeight: spaceBelow - 24,
        });
      } else {
        setCoords({
          top: undefined,
          bottom: window.innerHeight - rect.top + 8,
          left: rect.left,
          maxHeight: spaceAbove - 24,
        });
      }
    }
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    const handleOutsideInteraction = (event: Event) => {
      if (event instanceof KeyboardEvent && event.key === 'Escape') {
        handleClose();
        return;
      }

      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        if (event.type !== 'keydown') handleClose();
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleOutsideInteraction);
      document.addEventListener('wheel', handleOutsideInteraction, {
        capture: true,
        passive: true,
      });
      document.addEventListener('touchmove', handleOutsideInteraction, {
        capture: true,
        passive: true,
      });
      document.addEventListener('keydown', handleOutsideInteraction);
      window.addEventListener('resize', handleClose);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideInteraction);
      document.removeEventListener('wheel', handleOutsideInteraction, { capture: true });
      document.removeEventListener('touchmove', handleOutsideInteraction, { capture: true });
      document.removeEventListener('keydown', handleOutsideInteraction);
      window.removeEventListener('resize', handleClose);
    };
  }, [menuOpen]);

  const handleGameClick = (game: GameEntry) => {
    navigate(`${DEFAULT_VOD}?game_id=${game.id}`);
    handleClose();
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        disabled={is_live}
        onClick={handleClick}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
          is_live
            ? 'cursor-default bg-[#1e1e2a] text-[#4b5563]'
            : 'cursor-pointer bg-[#222230] text-[#f0f0f5] transition-colors hover:bg-[#2c2c3d]'
        }`}
      >
        <List size={14} className="text-[#9ca3af]" />
        <span>Games</span>
        <span className="ml-0.5 flex items-center justify-center rounded bg-[#6366f1] px-1.5 py-0.5 text-[10px] leading-none font-bold text-white">
          {gamesArray.length}
        </span>
      </button>

      {menuOpen &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[1300] animate-[fadeIn_0.2s_ease-out] overflow-hidden rounded-xl border border-[#222230] bg-[#16161e] shadow-2xl"
            style={{
              top: coords.top !== undefined ? coords.top : 'auto',
              bottom: coords.bottom !== undefined ? coords.bottom : 'auto',
              left: coords.left,
              width: 'max-content',
              minWidth: '200px',
              maxWidth: '200px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ maxHeight: `${Math.min(400, coords.maxHeight)}px`, overflowY: 'auto' }}>
              <div className="flex flex-col">
                {gamesArray.map((game) => (
                  <button
                    onClick={() => handleGameClick(game)}
                    key={game.id}
                    className="flex w-full cursor-default items-start gap-2 px-2 py-1.5 text-left transition-colors hover:bg-[#222230] sm:px-3 sm:py-2"
                  >
                    <div className="flex-shrink-0">
                      <img
                        alt=""
                        src={getImage(game.chapter_image, 40, 53, game.game_id)}
                        width={40}
                        height={53}
                        decoding="async"
                        loading="lazy"
                        className="h-[40px] w-[30px] sm:h-[53px] sm:w-[40px]"
                      />
                    </div>
                    <div className="flex w-full min-w-0 flex-col">
                      <span className="text-xs leading-snug break-words whitespace-normal text-[#f0f0f5] sm:text-sm">
                        {game.game_name}
                      </span>
                      {game.duration > 0 && (
                        <span className="mt-0.5 text-xs text-[#9ca3af]">{`${humanize(game.duration * 1000, { largest: 2 })}`}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
