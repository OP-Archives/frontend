import { ContentPage } from '@/pages/ContentPage';

export function Privacy() {
  return (
    <ContentPage
      title="Privacy Policy"
      subtitle="Last updated: June 1, 2026"
      sections={[
        {
          heading: 'Overview',
          content: (
            <p>
              This project ("archive") is a self-hosted tool that automatically uploads Twitch/KICK VODs to a YouTube
              channel after a stream ends.
            </p>
          ),
        },
        {
          heading: 'YouTube API Services',
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
              </a>{' '}
              to upload videos to a YouTube channel. By using YouTube API Services, this application is subject to the{' '}
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
          ),
        },
        {
          heading: 'Data Collected',
          content: (
            <ul className="list-inside list-disc space-y-1.5 leading-relaxed">
              <li>
                <strong>YouTube OAuth tokens</strong> — Used to authenticate with the YouTube API and upload videos.
                Stored locally in a PostgreSQL database on the operator's own server.
              </li>
              <li>
                <strong>Twitch VOD metadata</strong> — Video titles, descriptions, and timestamps used to populate
                YouTube upload details. Stored locally for upload logging purposes.
              </li>
              <li>
                <strong>Kick VOD metadata</strong> — Video titles, descriptions, and timestamps used to populate YouTube
                upload details. Stored locally for upload logging purposes.
              </li>
              <li>
                <strong>Upload logs</strong> — Records of upload activity (video ID, timestamp, status) stored locally
                for debugging.
              </li>
            </ul>
          ),
        },
        {
          heading: 'How Data Is Used',
          content: (
            <>
              <p>All collected data is used exclusively to:</p>
              <ul className="list-inside list-disc space-y-1.5">
                <li>Authenticate with Google/YouTube on behalf of the channel owner</li>
                <li>Upload Twitch VODs to the user's own YouTube channel</li>
                <li>Upload KICK VODs to the user's own YouTube channel</li>
                <li>Log upload activity for personal debugging and record-keeping</li>
              </ul>
              <p className="mt-3 font-medium">No data is sold, shared, or transmitted to any third party.</p>
            </>
          ),
        },
        {
          heading: 'Data Storage & Security',
          content: (
            <p>
              All data (OAuth tokens, logs, VOD metadata) is stored on the operator's own self-hosted server. No data is
              stored in third-party cloud services beyond what is necessary for the YouTube API OAuth flow (handled by
              Google).
            </p>
          ),
        },
        {
          heading: 'Data Deletion',
          content: (
            <p>
              You may revoke this application's access to your YouTube account at any time by visiting:{' '}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6366f1] hover:underline"
              >
                https://myaccount.google.com/permissions
              </a>{' '}
              Find the application and click "Remove Access." This will invalidate all stored OAuth tokens. Any locally
              stored tokens can then be deleted directly from the PostgreSQL database.
            </p>
          ),
        },
        {
          heading: "Children's Privacy",
          content: (
            <p>
              This tool is not directed at children and does not knowingly collect any information from individuals
              under the age of 13.
            </p>
          ),
        },
        {
          heading: 'Changes to This Policy',
          content: (
            <p>
              This privacy policy may be updated occasionally. Updates will be reflected by a new "Last updated" date at
              the top of this file.
            </p>
          ),
        },
        {
          heading: 'Contact',
          content: (
            <p>
              For any questions about this privacy policy, please open an issue on the{' '}
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
  );
}
