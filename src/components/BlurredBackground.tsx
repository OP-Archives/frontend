import backgroundDefault from '@/assets/background.jpg';

interface BlurredBackgroundProps {
  imageUrl?: string | null;
}

export function BlurredBackground({ imageUrl }: BlurredBackgroundProps) {
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
