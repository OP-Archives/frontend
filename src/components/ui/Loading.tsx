import { Loader2 } from 'lucide-react';

interface LoadingProps {
  logo?: string;
}

const Loading = ({ logo }: LoadingProps) => {
  const loadingLogo = logo || null;

  return (
    <div className="flex flex-col items-center justify-center">
      {loadingLogo && <img alt="" src={loadingLogo} className="h-auto max-h-[150px] max-w-full" />}
      <Loader2 className="h-6 w-6 animate-spin text-[#6366f1]" style={{ marginTop: loadingLogo ? '2rem' : '0' }} />
    </div>
  );
};

export { Loading };
export default Loading;
