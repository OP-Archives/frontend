import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { cardHover } from '@/motion/variants';
import { getImage } from '@/utils/helpers';

interface CardProps {
  item: {
    game_id: string;
    name?: string;
    game_name?: string;
    image?: string;
    chapter_image?: string;
    count: number;
  };
  type: 'games' | 'chapters';
}

export function Card({ item, type }: CardProps) {
  const { tenant } = useParams<{ tenant: string }>();
  const linkPath = type === 'games' ? 'games' : 'vods';
  const displayName = item.game_name ?? item.name ?? '';
  const displayImage = item.chapter_image ?? item.image;

  return (
    <Link
      to={`/${tenant}/${linkPath}?game_id=${item.game_id}`}
      className="block w-full min-w-0 cursor-pointer rounded no-underline"
    >
      <motion.div variants={cardHover} initial="initial" whileHover="whileHover" whileTap="whileTap">
        <div
          className="relative w-full rounded-t bg-[#6366f1] shadow-[0_8px_20px_rgba(99,102,241,0)]"
          style={{ aspectRatio: '400/530' }}
        >
          <motion.div className="absolute inset-0 overflow-hidden rounded-t bg-[#222230]" whileHover={{ x: -6, y: -6 }}>
            <img
              src={getImage(displayImage, 400, 530, item.game_id)}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          </motion.div>
        </div>
      </motion.div>
      <div className="w-full min-w-0 px-1 py-0.5 text-center">
        <span className="block truncate text-xs font-medium text-[#f0f0f5]">{displayName}</span>
        <span className="text-xs text-[#9ca3af]">{item.count || 0} EPs</span>
      </div>
    </Link>
  );
}
