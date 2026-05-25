import { useQuery } from '@tanstack/react-query';
import { useParams, useLocation, useNavigate, Outlet } from 'react-router-dom';
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
import { Games } from '@/games/Games';
import type { Tenant } from '@/types';
import { archiveClient } from '@/utils/archive-client';
import { Loading } from '@/utils/Loading';
import { Vods } from '@/vods/Vods';

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

interface Tab {
  label: string;
  path: string;
  visible?: boolean;
}

function NoContent() {
  return (
    <div className="mt-12 text-center">
      <p className="text-sm text-[#9ca3af]">No content available for this tenant.</p>
    </div>
  );
}

export function TenantProfileCard({ tenantData, centered = true }: { tenantData: Tenant; centered?: boolean }) {
  if (!tenantData) return null;
  const socials = tenantData.social_media || [];

  return (
    <div className={`flex w-full flex-col ${centered ? 'items-center text-center' : ''}`}>
      <div className="w-full rounded-lg p-6">
        <div className={`flex ${centered ? 'flex-col' : 'flex-row'} items-center gap-2`}>
          {/* Avatar */}
          <div className={`h-20 w-20 shrink-0 overflow-hidden rounded-full bg-[#222230] ring-2 ring-[#222230]`}>
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

          <div className={`flex flex-col ${centered ? 'items-center' : 'items-start'}`}>
            {/* Name */}
            <div className="flex items-baseline gap-3">
              <h1 className="text-2xl font-bold text-[#f0f0f5]">{tenantData.display_name}</h1>
              <span
                className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${tenantData.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#1e1e26] text-[#6b7280]'}`}
              >
                {tenantData.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Social Links */}
            {socials.length > 0 && (
              <div className={`mt-3 flex flex-wrap items-center gap-3`}>
                {socials.map(({ name, url }) => {
                  const Icon = platformIcons[name];
                  if (!Icon || !url) return null;
                  return (
                    <a
                      key={name}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-opacity hover:opacity-80"
                      aria-label={name}
                    >
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-full"
                        style={{
                          backgroundColor: name === 'kick' ? '#222230' : platformColors[name],
                        }}
                      >
                        <Icon className={name === 'kick' ? 'h-5 w-5 text-[#53fc18]' : 'h-5 w-5 text-white'} />
                      </span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TenantProfile() {
  const { tenant } = useParams<{ tenant: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const { data: tenantRes, isLoading } = useQuery({
    queryKey: ['tenant', tenant],
    queryFn: () => archiveClient.tenants.get(tenant!),
    enabled: !!tenant,
    retry: false,
  });

  const tenantData = tenantRes?.data;
  const hasContent = tenantData?.vods || tenantData?.games;

  const tabs: Tab[] = [
    { label: 'VODs', path: `/${tenant}`, visible: tenantData?.vods !== false },
    { label: 'Games', path: `/${tenant}/games`, visible: !!tenantData?.games },
    { label: 'Library', path: `/${tenant}/library`, visible: !!hasContent },
  ];

  const activeTab = tabs.find((t) => location.pathname === t.path)?.path || `/${tenant}`;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!tenantData) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#6366f1]">Not found</h2>
          <p className="mt-2 text-[#9ca3af]">Streamer not found</p>
        </div>
      </div>
    );
  }

  const currentPath = location.pathname;
  const isOnVods = currentPath === `/${tenant}`;
  const isOnGames = currentPath === `/${tenant}/games`;

  if (isOnVods && tenantData?.vods === false) {
    return tenantData?.games ? <Games /> : <NoContent />;
  }

  if (isOnGames && !tenantData?.games) {
    return tenantData?.vods !== false ? <Vods /> : <NoContent />;
  }

  const isPlayerRoute = /^\/[^/]+\/(vods|cdn|manual|games)\/[^/]+$/.test(currentPath);

  if (isPlayerRoute) {
    return (
      <div className="flex min-h-0 w-full flex-1 flex-col">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="py-8">
      <TenantProfileCard tenantData={tenantData} centered={true} />

      {/* Tab Bar */}
      <div className="mt-6 w-full border-b border-[#222230]">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`relative px-4 py-2.5 text-sm transition-colors ${tab.visible === false ? 'hidden' : ''} ${
                activeTab === tab.path ? 'text-[#f0f0f5]' : 'text-[#9ca3af] hover:text-[#f0f0f5]'
              }`}
            >
              {tab.label}
              {activeTab === tab.path && <div className="absolute right-0 bottom-0 left-0 h-[2px] bg-[#6366f1]" />}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
}
