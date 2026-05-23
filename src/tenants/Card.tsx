import { Link, useParams } from 'react-router-dom';
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
      className="block w-full min-w-0 cursor-pointer rounded no-underline transition-shadow"
    >
      <div className="group">
        <div
          className="relative w-full rounded-t bg-[#6366f1] transition-shadow duration-200 group-hover:shadow-[0_8px_20px_rgba(99,102,241,0.25)]"
          style={{ aspectRatio: '400/530' }}
        >
          <div className="absolute inset-0 overflow-hidden rounded-t bg-[#222230] transition-all duration-200 ease-out group-hover:-translate-x-1.5 group-hover:-translate-y-1.5 group-hover:shadow-[8px_8px_24px_rgba(0,0,0,0.6)]">
            {displayImage ? (
              <img
                src={getImage(displayImage, 400, 530)}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-[#9ca3af]">
                No image
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="w-full min-w-0 px-1 py-0.5 text-center">
        <span className="block truncate text-xs font-medium text-[#f0f0f5]">{displayName}</span>
        <span className="text-xs text-[#9ca3af]">{item.count || 0} EPs</span>
      </div>
    </Link>
  );
}
