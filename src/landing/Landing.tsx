import { ArrowRight, Video, MessageSquare, LayoutTemplate, Bookmark, Library, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TwitchIcon, KickIcon, DiscordIcon } from '@/assets/icons';
import { Background } from '@/components/Background';
import { RecentVodsCarousel } from '@/components/RecentVodsCarousel';
import { PricingTiers } from '@/components/ui/PricingTiers';
import { useRecentVods } from '@/hooks/useRecentVods';

const FEATURED_TENANTS = [
  {
    id: 'xqc',
    display_name: 'xQc',
    profile_image_url: 'https://op-archives.nyc3.cdn.digitaloceanspaces.com/profile_images/xqc.png',
    status: 'active',
    platforms: [
      { name: 'twitch', enabled: true, id: null },
      { name: 'kick', enabled: true, id: null },
    ],
  },
  {
    id: 'caedrel',
    display_name: 'Caedrel',
    profile_image_url: 'https://op-archives.nyc3.cdn.digitaloceanspaces.com/profile_images/caedrel.png',
    status: 'active',
    platforms: [{ name: 'twitch', enabled: true, id: null }],
  },
  {
    id: 'moonmoon',
    display_name: 'MOONMOON',
    profile_image_url: 'https://op-archives.nyc3.cdn.digitaloceanspaces.com/profile_images/moonmoon.png',
    status: 'active',
    platforms: [{ name: 'twitch', enabled: true, id: null }],
  },
  {
    id: 'quin69',
    display_name: 'Quin69',
    profile_image_url: 'https://op-archives.nyc3.cdn.digitaloceanspaces.com/profile_images/quin69.png',
    status: 'active',
    platforms: [{ name: 'twitch', enabled: true, id: null }],
  },
  {
    id: 'pokelawls',
    display_name: 'pokelawls',
    profile_image_url: 'https://op-archives.nyc3.cdn.digitaloceanspaces.com/profile_images/pokelawls.jpg',
    status: 'active',
    platforms: [{ name: 'twitch', enabled: true, id: null }],
  },
];

const platformConfig: Record<string, { icon: typeof TwitchIcon; color: string }> = {
  twitch: { icon: TwitchIcon, color: '#9146FF' },
  kick: { icon: KickIcon, color: '#53fc18' },
};

const FEATURES = [
  {
    icon: Video,
    title: 'Auto Archive',
    description: 'Automatic VOD detection and YouTube upload when streams end on Twitch or Kick.',
  },
  {
    icon: MessageSquare,
    title: 'Chat Replay',
    description: 'Full chat logs synced to VOD playback with BTTV, FFZ, and 7TV emote support.',
  },
  {
    icon: LayoutTemplate,
    title: 'Your Brand',
    description: 'Dedicated archive site that matches your brand identity - no white-label watermarks.',
  },
  {
    icon: Bookmark,
    title: 'Chapter Markers',
    description: 'Browse VODs by game/category with visual chapter markers and timestamps.',
  },
  {
    icon: Library,
    title: 'Games Library',
    description: 'Browse every game ever streamed, sortable by most streamed or most recent.',
  },
  {
    icon: Search,
    title: 'Smart Search',
    description: 'Filter VODs by title, game, chapter, date range, and platform.',
  },
];

export function Landing() {
  const navigate = useNavigate();
  const { data: recentVods, isLoading: recentVodsLoading } = useRecentVods();

  return (
    <div className="relative pb-[80px]">
      <Background />

      <div className="relative mx-auto max-w-[1800px] px-4 sm:px-6">
        <div className="flex flex-col items-center pt-6 sm:pt-12 md:pt-20">
          {/* Hero */}
          <div className="text-center">
            <h1 className="mx-auto max-w-xl text-center text-2xl font-extrabold tracking-tight text-[#f0f0f5] sm:max-w-none sm:text-3xl md:text-5xl lg:text-6xl">
              <span className="mr-2 text-[#6366f1] sm:mr-3 md:mr-4">op</span>
              <span className="text-[#f0f0f5]">archive</span>
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-xl font-bold text-[#6366f1] sm:mt-4 sm:max-w-2xl sm:text-2xl">
              Twitch &amp; Kick VOD Archive
            </p>
            <p className="mx-auto mt-2 max-w-xl text-sm text-[#f0f0f5] sm:mt-3 sm:max-w-2xl sm:text-base">
              Never lose a stream again. Automated VOD archiving for Twitch &amp; Kick - uploaded to your YouTube
              channel, with full chat replay synced to playback.
            </p>
            <div className="mx-auto mt-3 h-[1.5px] w-36 bg-[#6366f1]/40 sm:mt-4 sm:w-48" />
          </div>

          <div className="mt-4 w-full sm:mt-8">
            <div className="mx-auto flex max-w-sm flex-col gap-2 sm:max-w-none sm:flex-row sm:justify-center sm:gap-3">
              <button
                onClick={() => navigate('/archive')}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#6366f1] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4f46e5] sm:w-auto"
              >
                Start Archiving
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate('/browse')}
                className="flex w-full cursor-pointer items-center justify-center rounded-lg border border-[#222230] bg-[#16161e]/80 px-6 py-3 text-sm font-semibold text-[#f0f0f5] backdrop-blur-sm transition-colors hover:border-[#6366f1]/50 hover:bg-[#16161e] sm:w-auto"
              >
                Browse Streamers
              </button>
            </div>
          </div>

          {/* Featured Streamers */}
          <div className="mt-8 w-full sm:mt-12">
            <h2 className="mb-3 text-center text-2xl font-extrabold tracking-tight text-[#f0f0f5] sm:mb-4 sm:text-3xl lg:text-4xl">
              Used by Top Streamers
            </h2>
            <div className="mx-auto mb-3 h-[1.5px] w-36 bg-[#6366f1]/40 sm:mb-4 sm:w-48" />
            <div className="mx-auto flex w-fit flex-wrap justify-center gap-2 sm:gap-3">
              {FEATURED_TENANTS.map((tenant) => (
                <button
                  key={tenant.id}
                  onClick={() => navigate(`/${tenant.id}`)}
                  className="group flex min-w-[120px] flex-shrink-0 cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-[#222230] bg-[#16161e]/80 py-2 backdrop-blur-sm transition-all hover:border-[#6366f1]/50 hover:bg-[#16161e] sm:min-w-[150px] sm:gap-2 sm:py-3"
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#222230] sm:h-14 sm:w-14 lg:h-16 lg:w-16">
                    {tenant.profile_image_url ? (
                      <img
                        src={tenant.profile_image_url}
                        alt={tenant.display_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-base font-bold text-[#9ca3af] sm:text-lg">
                        {tenant.display_name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs font-medium text-[#f0f0f5] group-hover:text-[#6366f1] sm:text-sm">
                    {tenant.display_name}
                  </p>
                  <div className="flex items-center gap-1">
                    {tenant.platforms
                      .filter((p) => p.enabled)
                      .map((p) => {
                        const config = platformConfig[p.name];
                        if (!config) return null;
                        const Icon = config.icon;
                        return <Icon key={p.name} className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: config.color }} />;
                      })}
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => navigate('/browse')}
              className="mx-auto mt-4 flex cursor-pointer items-center gap-1 rounded-lg bg-[#6366f1] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#4f46e5]"
            >
              View All
            </button>
          </div>

          {/* Recent VODs */}
          <div className="mt-8 w-full sm:mt-12 sm:max-w-6xl">
            <RecentVodsCarousel recentVods={recentVods || []} isLoading={recentVodsLoading} />
          </div>

          {/* Features */}
          <div className="mt-8 w-full sm:mt-12 sm:max-w-6xl">
            <div className="text-center">
              <h2 className="text-2xl font-extrabold tracking-tight text-[#f0f0f5] sm:text-3xl lg:text-4xl">
                Everything You Need
              </h2>
              <p className="mx-auto mt-1 max-w-lg px-2 text-sm text-[#f0f0f5] sm:mt-2 sm:max-w-2xl sm:text-base">
                From automatic archiving to chat replay - a complete solution for preserving your streams.
              </p>
              <div className="mx-auto mt-2 h-[1.5px] w-36 bg-[#6366f1]/40 sm:mt-3 sm:w-48" />
            </div>
            <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border border-[#222230] bg-[#16161e] p-4 transition-colors hover:border-[#6366f1]/30 sm:p-6"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#222230] text-[#6366f1] sm:mb-4">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-1 text-base font-bold text-[#f0f0f5] sm:mb-2 sm:text-lg">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-[#9ca3af] sm:text-base">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="mt-16 w-full max-w-7xl sm:mt-20">
            <PricingTiers />
          </div>

          {/* Discord CTA */}
          <div className="mt-12 w-full max-w-2xl text-center sm:mt-16 sm:max-w-3xl">
            <h2 className="text-2xl font-extrabold tracking-tight text-[#f0f0f5] sm:text-3xl lg:text-4xl">
              Join Our Community
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-[#9ca3af] sm:mt-3 sm:max-w-2xl sm:text-base">
              Have a feature request, bug report, or any questions? Join us on Discord for support and updates.
            </p>
            <div className="mt-6 sm:mt-8">
              <a
                href="https://discord.gg/MMkrjWkCmS"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#6366f1] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4f46e5]"
              >
                <DiscordIcon className="h-4 w-4" />
                Join the Discord
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
