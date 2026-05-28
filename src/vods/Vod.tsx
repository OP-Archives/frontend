import { useEffect, useState, useMemo } from 'react';
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

  const { cdnBaseUrl, tenant: tenantData } = useTenantContext();

  const twitchId = useMemo(() => {
    if (!tenantData) return undefined;
    const p = tenantData.platforms.find((pl) => pl.name === 'twitch');
    if (!p || !p.id) return undefined;
    return parseInt(p.id, 10);
  }, [tenantData]);
  const { data: vod, isLoading, error } = useVod(tenant!, vodId!);
  const [errorShown, setErrorShown] = useState(false);

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

  if (error && !errorShown) {
    setErrorShown(true);
    setTimeout(() => navigate(`/${tenant}`, { replace: true }), 2000);
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500">Failed to load VOD</h2>
          <p className="mt-2 text-[#9ca3af]">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (!vod) {
    return <NotFound />;
  }

  const renderPlayer = () => {
    switch (routeType) {
      case 'vods':
        return <YoutubeVod twitchId={twitchId} />;
      case 'cdn':
        return <CustomVod type="cdn" cdnBase={cdnBaseUrl} twitchId={twitchId} />;
      case 'manual':
        return <CustomVod type="manual" twitchId={twitchId} />;
      case 'games':
        return <Games twitchId={twitchId} />;
      default:
        return <YoutubeVod twitchId={twitchId} />;
    }
  };

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-[1920px] flex-1 flex-col">
      <div className="relative flex h-full min-h-0 flex-1 flex-col">{renderPlayer()}</div>
    </div>
  );
}
