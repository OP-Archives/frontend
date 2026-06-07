import { Background } from '@/components/Background';
import { ContentPage } from '@/pages/ContentPage';

export function TermsOfService() {
  return (
    <div className="relative">
      <Background />
      <ContentPage
        title="Terms of Service"
        subtitle="Last updated: June 1, 2026"
        sections={[
          {
            heading: 'Overview',
            content: (
              <p>
                This project ("archive") is a personal, self-hosted tool that automatically uploads Twitch VODs to a
                YouTube channel.
              </p>
            ),
          },
          {
            heading: 'Use of YouTube API Services',
            content: (
              <p>
                This application uses the{' '}
                <a
                  href="https://developers.google.com/youtube/terms/api-services-terms-of-service"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#6366f1] hover:underline"
                >
                  YouTube API Services
                </a>
                . By using this application, you agree to be bound by the{' '}
                <a
                  href="https://www.youtube.com/t/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#6366f1] hover:underline"
                >
                  YouTube Terms of Service
                </a>
                .
              </p>
            ),
          },
          {
            heading: 'Intended Use',
            content: (
              <ul className="list-inside list-disc space-y-1.5 leading-relaxed">
                <li>Automatically download Twitch/KICK VODs after a stream ends</li>
                <li>Upload those VODs to a YouTube channel owned by that user</li>
                <li>Serve as an API for VOD playback with chat replay</li>
              </ul>
            ),
          },
          {
            heading: 'No Warranty',
            content: (
              <p>
                This software is provided "as is," without warranty of any kind, express or implied. The operator makes
                no guarantees about uptime, functionality, or fitness for any particular purpose.
              </p>
            ),
          },
          {
            heading: 'Limitation of Liability',
            content: (
              <p>
                The operator shall not be liable for any damages arising from the use or inability to use this software,
                including but not limited to lost data, upload failures, or YouTube API quota issues.
              </p>
            ),
          },
          {
            heading: 'Third-Party Services',
            content: (
              <ul className="list-inside list-disc space-y-1.5 leading-relaxed">
                <li>
                  <a
                    href="https://www.youtube.com/t/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#6366f1] hover:underline"
                  >
                    YouTube Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="https://policies.google.com/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#6366f1] hover:underline"
                  >
                    Google Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.twitch.tv/p/en/legal/terms-of-service/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#6366f1] hover:underline"
                  >
                    Twitch Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="https://kick.com/terms-of-service"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#6366f1] hover:underline"
                  >
                    KICK Terms of Service
                  </a>
                </li>
              </ul>
            ),
          },
          {
            heading: 'Changes to These Terms',
            content: (
              <p>
                These terms may be updated occasionally. Updates will be reflected by a new "Last updated" date at the
                top of this file.
              </p>
            ),
          },
          {
            heading: 'Contact',
            content: (
              <p>
                For questions, please open an issue on the{' '}
                <a
                  href="https://github.com/TimIsOverpowered/archive"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#6366f1] hover:underline"
                >
                  GitHub repository
                </a>
                .
              </p>
            ),
          },
        ]}
      />
    </div>
  );
}
