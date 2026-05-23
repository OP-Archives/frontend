import { ContentPage } from '@/pages/ContentPage';

export function About() {
  return (
    <ContentPage
      title={
        <>
          <span className="text-[#6366f1]">op</span> <span>archive</span>
        </>
      }
      subtitle="A platform for watching your favorite streamers' archived VODs"
      sections={[
        {
          heading: 'What is op archive?',
          content: (
            <p>
              op archive is a platform designed for streamers and their communities to archive, organize, and watch VODs
              and or Games from multi-platforms like Twitch and Kick. It provides a clean viewing experience.
            </p>
          ),
        },
        {
          heading: 'Features',
          content: (
            <ul className="list-inside list-disc space-y-1.5">
              <li>VOD playback with chapter navigation and live chat replay</li>
              <li>A Library to show Recently Played Games / Most Played Games</li>
              <li>Multi-platform support for Twitch and Kick</li>
              <li>Search and filter across VODs, games, and library content</li>
              <li>Custom CDN and manual with a custom player</li>
              <li>Responsive design that works on desktop and mobile</li>
            </ul>
          ),
        },
        {
          heading: 'Support me',
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
