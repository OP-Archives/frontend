import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import CustomWidthTooltip from '@/components/ui/CustomToolTip';
import { cardHover } from '@/motion/variants';
import type { GameData } from '@/types';
import { toHHMMSS, getImage } from '@/utils/helpers';

const GAME_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

interface GamesGridProps {
  games: GameData[] | null;
  isLoading: boolean;
  tenant: string;
  limit: number;
}

export function GamesGrid({ games, isLoading, tenant, limit }: GamesGridProps) {
  if (isLoading) {
    return (
      <div className="mt-2 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="block w-full min-w-0">
            <div className="relative aspect-video w-full overflow-hidden bg-[#222230]">
              <div className="absolute inset-0 animate-pulse bg-[#16161e]" />
              <div className="absolute bottom-0 left-0">
                <span className="animate-pulse rounded bg-[#222230] p-1.5">
                  <span className="block h-[16px] w-[50px]" />
                </span>
              </div>
              <div className="absolute right-0 bottom-0">
                <span className="animate-pulse rounded bg-[#222230] p-1.5">
                  <span className="block h-[16px] w-[30px]" />
                </span>
              </div>
            </div>
            <div className="mt-1 mb-1 flex cursor-default items-start">
              <div className="h-[53px] w-[40px] shrink-0 animate-pulse rounded bg-[#222230]" />
              <div className="mt-2 min-w-0 flex-1 pl-2">
                <div className="w-full min-w-0 p-0.5">
                  <span className="block h-[16px] w-3/4 animate-pulse rounded bg-[#6366f1]/30" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (games && games.length === 0) {
    return <p className="mt-12 text-center text-sm text-[#9ca3af]">No games found matching your search filters.</p>;
  }

  if (games && games.length > 0) {
    return (
      <div className="mt-2 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {games.map((game: GameData) => (
          <div key={game.id} className="block w-full min-w-0 cursor-pointer">
            <motion.div
              className="group relative aspect-video w-full rounded-md bg-[#6366f1] shadow-[0_8px_20px_rgba(99,102,241,0)]"
              variants={cardHover}
              initial="initial"
              whileHover="whileHover"
              whileTap="whileTap"
            >
              <motion.div
                className="absolute inset-0 overflow-hidden rounded-md bg-[#222230]"
                whileHover={{ x: -6, y: -6 }}
              >
                <a href={`/${tenant}/games/${game.vod_id}?game_id=${game.id}`}>
                  {game.thumbnail_url ? (
                    <img className="thumbnail h-full w-full object-cover" alt="" src={game.thumbnail_url} />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-sm text-[#9ca3af]">?</div>
                  )}
                </a>
                <motion.div
                  className="shadow-glow pointer-events-none absolute inset-0"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                />
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute bottom-0 left-0">
                    <span className="bg-black/60 p-1.5 text-xs text-white">
                      {GAME_DATE_FORMATTER.format(new Date(game.created_at))}
                    </span>
                  </div>
                </div>
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute right-0 bottom-0">
                    <span className="bg-black/60 p-1.5 text-xs text-white">{toHHMMSS(game.duration)}</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
            <div className="mt-1 mb-1 flex cursor-default items-start">
              {game.chapter_image && (
                <div className="mr-2 shrink-0">
                  <img
                    alt=""
                    src={getImage(game.chapter_image, 40, 53)}
                    width={40}
                    height={53}
                    className="pointer-events-none h-[53px] w-[40px] shrink-0 object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <Link
                  to={`/${tenant}/games/${game.vod_id}?game_id=${game.id}`}
                  className="inline-flex max-w-full min-w-0 no-underline"
                >
                  <CustomWidthTooltip title={game.title || game.game_name || ''}>
                    <span className="truncate text-xs font-medium text-[#6366f1] hover:text-[#6366f1]/80">
                      {game.title || game.game_name || ''}
                    </span>
                  </CustomWidthTooltip>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}
