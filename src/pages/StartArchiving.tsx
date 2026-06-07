import {
  Check,
  Info,
  Video,
  MessageSquare,
  Play,
  Upload,
  Scissors,
  Globe,
  Music,
  Zap,
  Shield,
  Film,
  ListFilter,
  Library,
  Clock3,
  Image,
  Settings,
  Type,
  SkipBack,
} from 'lucide-react';
import { MailIcon, DiscordIcon, XIcon } from '@/assets/icons';

interface FeatureItem {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  note?: string;
}

interface FeatureCategory {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  gradient: string;
  features: FeatureItem[];
}

const CATEGORIES: FeatureCategory[] = [
  {
    icon: Video,
    title: 'Archiving & Upload',
    description: 'Automated VOD capture and YouTube publishing',
    gradient: 'from-violet-500/20 to-indigo-500/20',
    features: [
      {
        icon: Zap,
        text: 'Automatic VOD detection and archiving when streams end on Twitch or Kick',
      },
      {
        icon: Upload,
        text: "Direct upload to the streamer's own YouTube channel",
      },
      {
        icon: Globe,
        text: 'Configurable public/private YouTube uploads',
      },
      {
        icon: Scissors,
        text: "Long VOD splitting — automatically splits videos that exceed YouTube's duration limits",
      },
      {
        icon: Film,
        text: 'Per-game uploads — individual game/category segments as separate YouTube videos',
      },
      {
        icon: Music,
        text: 'Multi-track audio upload support',
      },
      {
        icon: Zap,
        text: 'Live stream upload support (separate from VOD archiving)',
      },
      {
        icon: Shield,
        text: 'DMCA handling — detects and processes copyright claims automatically',
        note: 'Protects against music and licensed content issues',
      },
      {
        icon: Globe,
        text: 'CDN support for video delivery',
        note: 'Available with additional charges, limited to 14 days of VODs',
      },
    ],
  },
  {
    icon: MessageSquare,
    title: 'Chat Replay',
    description: 'Full chat logs synced to VOD playback',
    gradient: 'from-cyan-500/20 to-blue-500/20',
    features: [
      {
        icon: MessageSquare,
        text: 'Full chat log capture for every stream on Twitch and Kick',
      },
      {
        icon: Image,
        text: 'Third-party emote support: BTTV, FFZ, and 7TV',
      },
      {
        icon: Check,
        text: 'Twitch and Kick badge support',
      },
      {
        icon: Clock3,
        text: 'TimescaleDB-backed chat storage with time-based compression for efficient scaling',
      },
    ],
  },
  {
    icon: Play,
    title: 'Viewer Experience',
    description: 'Everything viewers need to explore and enjoy the archive',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    features: [
      {
        icon: Globe,
        text: 'Dedicated archive site per streamer',
      },
      {
        icon: MessageSquare,
        text: 'Chat replay synced to VOD playback',
      },
      {
        icon: Film,
        text: 'Chapter/game markers — browse a VOD by which game was being played',
      },
      {
        icon: Clock3,
        text: 'Previous/next VOD navigation',
      },
      {
        icon: Image,
        text: 'Thumbnail support for every VOD',
      },
      {
        icon: Film,
        text: 'Per-game context (box art, game name, timestamps)',
      },
      {
        icon: ListFilter,
        text: 'Full search and filtering — search VODs by title, game name, chapter, date range, and platform',
      },
      {
        icon: Library,
        text: 'Games library — browseable index of every game ever streamed, sortable by most streamed or most recent',
      },
      {
        icon: SkipBack,
        text: 'Resume playback — automatically continues from where you left off in previous sessions',
      },
      {
        icon: Settings,
        text: 'Player settings — volume, mute, and playback speed persist across sessions',
      },
      {
        icon: Type,
        text: 'Chat settings — customize font family, font size, chat width, delay sync, filter words, timestamps, and chat position',
      },
    ],
  },
];

const CONTACT_LINKS = [
  {
    icon: MailIcon,
    label: 'Email',
    href: 'mailto:op@overpowered.tv',
    username: 'op@overpowered.tv',
  },
  {
    icon: DiscordIcon,
    label: 'Discord',
    href: '',
    username: 'Overpowered',
  },
  {
    icon: XIcon,
    label: 'X',
    href: 'https://x.com/Overpowered',
    username: 'Overpowered',
  },
];

function FeatureCard({ category }: { category: FeatureCategory }) {
  return (
    <div className="rounded-xl border border-[#222230] bg-[#16161e] p-6">
      <div>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#222230] text-[#6366f1]">
            <category.icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#f0f0f5]">{category.title}</h3>
            <p className="text-xs text-[#9ca3af]">{category.description}</p>
          </div>
        </div>
        <ul className="space-y-3">
          {category.features.map((feature) => (
            <li key={feature.text} className="flex items-start gap-2.5">
              <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#6366f1]" />
              <div>
                <p className="text-sm leading-relaxed text-[#d1d5db]">{feature.text}</p>
                {feature.note && (
                  <div className="mt-1.5 flex items-center gap-1.5 rounded-md bg-[#222230]/60 px-2 py-1">
                    <Info className="h-3.5 w-3.5 text-[#6366f1]/70" />
                    <p className="text-xs text-[#9ca3af]">{feature.note}</p>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function StartArchiving() {
  return (
    <div className="relative">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#f0f0f5] sm:text-5xl">Start Archiving Today!</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[#9ca3af]">
            Everything you need to preserve, organize, and share your streams — automatically.
          </p>
          <div className="mx-auto mt-4 h-[1.5px] w-48 bg-[#6366f1]/40" />
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {CATEGORIES.map((category) => (
            <FeatureCard key={category.title} category={category} />
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-lg text-[#f0f0f5]">
            Have questions or ready to get started? Reach out through any of these channels.
          </p>
          <p className="mt-2 text-sm text-[#9ca3af]">I typically respond within 24 hours</p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CONTACT_LINKS.map((contact) => {
            const Icon = contact.icon;
            const isLink = contact.href !== '';
            const content = (
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[#222230] text-[#6366f1] transition-colors group-hover:bg-[#6366f1]/20">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#f0f0f5] group-hover:text-[#6366f1]">{contact.label}</p>
                  {contact.username ? <p className="mt-1 text-sm text-[#f0f0f5]">{contact.username}</p> : null}
                </div>
              </div>
            );

            if (isLink) {
              return (
                <a
                  key={contact.label}
                  href={contact.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-lg border border-[#222230] bg-[#16161e]/80 p-6 backdrop-blur-sm transition-all hover:border-[#6366f1]/50 hover:bg-[#16161e]"
                >
                  {content}
                </a>
              );
            }

            return (
              <div
                key={contact.label}
                className="group rounded-lg border border-[#222230] bg-[#16161e]/80 p-6 backdrop-blur-sm transition-all hover:border-[#6366f1]/50 hover:bg-[#16161e]"
              >
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
