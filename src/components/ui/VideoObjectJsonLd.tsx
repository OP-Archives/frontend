interface VideoObjectJsonLdProps {
  title: string;
  thumbnailUrl: string;
  uploadDate: string;
  durationSeconds: number;
  displayName: string;
}

export default function VideoObjectJsonLd({
  title,
  thumbnailUrl,
  uploadDate,
  durationSeconds,
  displayName,
}: VideoObjectJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: title,
    description: `Archived stream from ${displayName}.`,
    thumbnailUrl: [thumbnailUrl],
    uploadDate,
    duration: `PT${durationSeconds}S`,
    embedUrl: window.location.href,
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}
