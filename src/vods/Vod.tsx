import { useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import CustomVod from '@/components/player/CustomVod';
import Games from '@/components/player/Games';
import YoutubeVod from '@/components/player/YoutubeVod';
import { Loading } from '@/components/ui/Loading';
import { NotFound } from '@/components/ui/NotFound';
import { useTenantContext } from '@/contexts/TenantContext';
import { useVod } from '@/hooks/useVods';

export function Vod() {
  const params = useParams<{ tenant: string; vodId: string }>();
  const tenant = params.tenant;
  const vodId = params.vodId;
  const location = useLocation();
  const navigate = useNavigate();
  const routeType = location.pathname.match(/\/(vods|cdn|manual|games)\//)?.[1] ?? 'vods';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.history.back();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const { cdnBaseUrl } = useTenantContext();
  const { data: vod, isLoading, error } = useVod(tenant!, vodId!);

  if (!tenant || !vodId) {
    return <NotFound />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error) {
    navigate(`/${tenant}`, { replace: true });
    return null;
  }

  if (!vod) {
    return <NotFound />;
  }

  const renderPlayer = () => {
    switch (routeType) {
      case 'vods':
        return <YoutubeVod />;
      case 'cdn':
        return <CustomVod type="cdn" cdnBase={cdnBaseUrl} />;
      case 'manual':
        return <CustomVod type="manual" />;
      case 'games':
        return <Games />;
      default:
        return <YoutubeVod />;
    }
  };

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-[1920px] flex-1 flex-col">
      <div className="relative flex h-full min-h-0 flex-1 flex-col">{renderPlayer()}</div>
    </div>
  );
}
