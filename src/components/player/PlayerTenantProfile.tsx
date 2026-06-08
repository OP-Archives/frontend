import { useNavigate } from 'react-router-dom';
import {
  TwitchIcon,
  YouTubeIcon,
  XIcon,
  DiscordIcon,
  RedditIcon,
  KickIcon,
  TikTokIcon,
  InstagramIcon,
  SoundCloudIcon,
} from '@/assets/icons';
import type { Tenant } from '@/types';
import { normalizePlatformName } from '@/utils/helpers';

const platformIcons: Record<string, typeof TwitchIcon> = {
  twitch: TwitchIcon,
  youtube: YouTubeIcon,
  twitter: XIcon,
  discord: DiscordIcon,
  reddit: RedditIcon,
  kick: KickIcon,
  tiktok: TikTokIcon,
  instagram: InstagramIcon,
  soundcloud: SoundCloudIcon,
};

const platformColors: Record<string, string> = {
  twitch: '#9146FF',
  youtube: '#FF0000',
  twitter: '#000000',
  discord: '#5865F2',
  reddit: '#FF4500',
  kick: '#53fc18',
  tiktok: '#000000',
  instagram: '#E4405F',
  soundcloud: '#FF5500',
};

export function PlayerTenantProfile({ tenantData }: { tenantData: Tenant }) {
  const navigate = useNavigate();
  if (!tenantData) return null;
  const socials = tenantData.social_media || [];

  return (
    <div className="w-full border border-[#222230] bg-[#16161e]">
      <div className="flex items-center gap-4 p-4">
        {/* Avatar */}
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-[#222230] ring-2 ring-[#222230]">
          {tenantData.profile_image_url ? (
            <img
              src={tenantData.profile_image_url}
              alt={tenantData.display_name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-[#9ca3af]">
              {tenantData.display_name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex flex-col items-start">
          {/* Name */}
          <button
            onClick={() => navigate(`/${tenantData.id}`)}
            className="cursor-pointer text-2xl font-bold text-[#f0f0f5] transition-colors hover:text-[#6366f1]"
          >
            {tenantData.display_name}
          </button>

          {/* Social Links */}
          {socials.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {socials.map(({ name, url }) => {
                const key = normalizePlatformName(name);
                const Icon = platformIcons[key];
                if (!Icon || !url) return null;
                return (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-opacity hover:opacity-80"
                    aria-label={name}
                  >
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: key === 'kick' ? '#222230' : platformColors[key],
                      }}
                    >
                      <Icon className={key === 'kick' ? 'h-5 w-5 text-[#53fc18]' : 'h-5 w-5 text-white'} />
                    </span>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
