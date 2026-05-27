import backgroundDefault from '@/assets/background.jpg';

interface BackgroundProps {
  imageUrl?: string | null;
}

export function Background({ imageUrl }: BackgroundProps) {
  const src = imageUrl || backgroundDefault;

  return (
    <>
      <div
        className="fixed inset-0 z-[-1]"
        style={{
          backgroundImage: `url(${src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'saturate(1.2)',
        }}
      />
      <div className="fixed inset-0 z-[-1] bg-gradient-to-b from-[#0a0a0f]/90 via-[#0a0a0f]/50 to-[#0a0a0f]/90" />
    </>
  );
}
