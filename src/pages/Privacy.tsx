import { ContentPage } from '@/pages/ContentPage';

export function Privacy() {
  return (
    <ContentPage
      title="Privacy Policy"
      subtitle="Last updated: June 2, 2026"
      sections={[
        {
          heading: 'Overview',
          content: (
            <p>
              This project ("archive") is a multi-platform VOD archiving and upload service for commercial use. The
              platform automatically archives live stream VODs from streaming platforms — including Twitch and KICK —
              and uploads them to YouTube channels on behalf of content creators. It includes a frontend web application
              at overpowered.tv for viewers to watch archived VODs with chat replay.
            </p>
          ),
        },
        {
          heading: 'YouTube API Services',
          content: (
            <>
              <p>
                This application uses the YouTube API Services to upload videos to YouTube channels on behalf of
                connected content creators.
              </p>
              <p>
                By using YouTube API Services, this application is subject to the{' '}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#6366f1] hover:underline"
                >
                  Google Privacy Policy
                </a>
                .
              </p>
            </>
          ),
        },
        {
          heading: 'Cookies and Tracking Technologies',
          content: (
            <>
              <p>This platform does not use cookies, tracking pixels, or any third-party tracking technology.</p>
              <p>
                The frontend web application uses browser localStorage exclusively to save viewer preferences locally on
                the viewer&apos;s own device. No data from localStorage is transmitted to our servers or any third
                party. The following items are stored:
              </p>
              <ul className="list-inside list-disc space-y-1.5 leading-relaxed">
                <li>
                  <strong>lastPlayed</strong> — The resume position (timestamp) for VODs the viewer has watched, stored
                  locally so playback can resume where the viewer left off. Keyed per creator and VOD ID.
                </li>
                <li>
                  <strong>player-settings</strong> — The viewer&apos;s player preferences, specifically volume level and
                  muted state.
                </li>
              </ul>
              <p>
                This data never leaves the viewer&apos;s browser and is not accessible to us. Viewers can clear this
                data at any time by clearing their browser&apos;s site data for this domain.
              </p>
              <p>The backend service does not interact with browser storage in any way.</p>
            </>
          ),
        },
        {
          heading: 'Data Collected by the Backend',
          content: (
            <>
              <p>This application collects and stores the following data solely to perform its function:</p>
              <ul className="list-inside list-disc space-y-1.5 leading-relaxed">
                <li>
                  <strong>YouTube OAuth tokens</strong> — Used to authenticate with the YouTube API and upload videos on
                  behalf of each connected creator. Stored in a PostgreSQL database on the operator&apos;s server.
                </li>
                <li>
                  <strong>Stream VOD metadata</strong> — Video titles, descriptions, and timestamps sourced from Twitch
                  or KICK, used to populate YouTube upload details. Stored for upload logging purposes.
                </li>
                <li>
                  <strong>Upload logs</strong> — Records of upload activity (video ID, timestamp, status) stored for
                  operational logging.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: 'How Data Is Used',
          content: (
            <>
              <p>All collected data is used exclusively to:</p>
              <ul className="list-inside list-disc space-y-1.5">
                <li>Authenticate with Google/YouTube on behalf of connected content creators</li>
                <li>Upload Twitch and KICK VODs to each creator&apos;s own YouTube channel</li>
                <li>Log upload activity for operational record-keeping</li>
              </ul>
              <p className="mt-3 font-medium">No data is sold, shared, or transmitted to any third party.</p>
            </>
          ),
        },
        {
          heading: 'Data Retention and Deletion',
          content: (
            <>
              <p>
                YouTube API data (video IDs, upload metadata, and OAuth tokens) is written to our database at the time
                of upload and is not periodically re-fetched or refreshed from the YouTube API after the initial upload.
              </p>
              <p>
                Stored YouTube API data is retained until a content creator explicitly requests deletion. Upon request,
                all associated YouTube data — including video IDs, metadata, and OAuth tokens — is permanently deleted
                from our database. We do not retain this data after a deletion request is fulfilled.
              </p>
              <p>
                Content creators may also revoke this application&apos;s access to their YouTube account at any time by
                visiting:
              </p>
              <p>
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#6366f1] hover:underline"
                >
                  https://myaccount.google.com/permissions
                </a>
              </p>
              <p>
                Find the application and click &quot;Remove Access.&quot; This will immediately invalidate all stored
                OAuth tokens.
              </p>
            </>
          ),
        },
        {
          heading: "Children's Privacy",
          content: (
            <p>
              This platform is not directed at children and does not knowingly collect any information from individuals
              under the age of 13.
            </p>
          ),
        },
        {
          heading: 'Changes to This Policy',
          content: (
            <p>
              This privacy policy may be updated occasionally. Updates will be reflected by a new &quot;Last
              updated&quot; date at the top of this file.
            </p>
          ),
        },
        {
          heading: 'Contact',
          content: <p>For any questions about this privacy policy, please open an issue on the GitHub repository.</p>,
        },
      ]}
    />
  );
}
