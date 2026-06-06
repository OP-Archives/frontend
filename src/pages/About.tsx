import {
  Video,
  MessageSquare,
  Upload,
  Scissors,
  Shield,
  ListFilter,
  Library,
  Image,
  Clock3,
  Zap,
  Globe,
  Film,
} from 'lucide-react';
import { ContentPage } from '@/pages/ContentPage';

interface FeatureBadge {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
}

const HIGHLIGHTS: FeatureBadge[] = [
  {
    icon: Video,
    label: 'Multi-Platform',
    description: 'Full support for Twitch and Kick VODs and live streams',
  },
  {
    icon: Scissors,
    label: 'Auto VOD Splitting',
    description: "Videos exceeding YouTube's duration limits are split automatically",
  },
  {
    icon: Upload,
    label: 'Per-Game Uploads',
    description: 'Each game segment uploaded as a separate YouTube video with chapters',
  },
  {
    icon: Shield,
    label: 'DMCA Handling',
    description: 'Automatic detection and processing of copyright claims',
  },
  {
    icon: MessageSquare,
    label: 'Chat Replay',
    description: 'Full chat logs synced to VOD playback with BTTV, FFZ, and 7TV emotes',
  },
  {
    icon: Image,
    label: 'Per-Stream Emotes',
    description: 'Each VOD loads the exact emotes active during that stream',
  },
  {
    icon: ListFilter,
    label: 'Search & Filter',
    description: 'Search VODs by title, game name, chapter, date range, and platform',
  },
  {
    icon: Library,
    label: 'Games Library',
    description: 'Browseable index of every game streamed, sortable by most or recent',
  },
  {
    icon: Film,
    label: 'Chapter Navigation',
    description: 'Browse VODs by game segments with box art and timestamps',
  },
  {
    icon: Globe,
    label: 'CDN Delivery',
    description: 'Content delivery network support for reliable video playback',
  },
  {
    icon: Clock3,
    label: 'Resume Playback',
    description: 'Automatically resumes from where you left off in previous sessions',
  },
  {
    icon: Zap,
    label: 'Live Stream Upload',
    description: 'Direct upload of live streams separate from VOD archiving, it can handle multi-audio track.',
  },
];

export function About() {
  return (
    <ContentPage
      title={
        <>
          <span className="text-[#6366f1]">op</span> <span>archive</span>
        </>
      }
      subtitle="Watch your favorite streamers' archived VODs"
      sections={[
        {
          heading: 'About',
          content: (
            <p>
              op archive was built out of a simple frustration: streamers lose their VODs as Twitch and Kick don't keep
              them forever. There's also no real way to organize or share them with your community.
            </p>
          ),
        },
        {
          heading: 'What We Do',
          content: (
            <p>
              We automated the entire pipeline — from detecting when a stream ends, to capturing the VOD, splitting it
              into per-game segments, uploading to YouTube, and syncing the full chat replay with emotes. Every step is
              handled so streamers can focus on streaming.
            </p>
          ),
        },
        {
          heading: 'Highlights',
          content: (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {HIGHLIGHTS.map((badge) => {
                const Icon = badge.icon;
                return (
                  <div
                    key={badge.label}
                    className="group rounded-lg border border-[#222230] bg-[#16161e]/60 p-4 transition-all hover:border-[#6366f1]/40 hover:bg-[#16161e]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-[#222230] text-[#6366f1] transition-colors group-hover:bg-[#6366f1]/20">
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <span className="text-sm font-semibold text-[#f0f0f5] group-hover:text-[#6366f1]">
                        {badge.label}
                      </span>
                    </div>
                    <p className="mt-2.5 pl-12 text-xs leading-relaxed text-[#9ca3af]">{badge.description}</p>
                  </div>
                );
              })}
            </div>
          ),
        },
        {
          heading: 'Support Me',
          content: (
            <p>
              If you enjoy it, consider supporting me through{' '}
              <a
                href="https://ko-fi.com/overpoweredgg"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6366f1] hover:underline"
              >
                Ko-fi
              </a>
            </p>
          ),
        },
        {
          heading: 'Issues & Feature Requests',
          content: (
            <p>
              Found a bug or have an idea? Open an issue on{' '}
              <a
                href="https://github.com/OP-Archives/frontend/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6366f1] hover:underline"
              >
                GitHub
              </a>
            </p>
          ),
        },
      ]}
    />
  );
}
