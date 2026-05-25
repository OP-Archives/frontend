import { Loader2 } from 'lucide-react';

export default function Loading({ logo }: { logo?: string }) {
  const loadingLogo = logo || null;

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center">
        {loadingLogo && <img alt="" src={loadingLogo} className="h-auto max-h-[150px] max-w-full" />}
        <Loader2 className="h-6 w-6 animate-spin text-[#6366f1]" style={{ marginTop: loadingLogo ? '2rem' : '0' }} />
      </div>
    </div>
  );
}
