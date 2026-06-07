import { useMemo, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
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
  const routeType = location.pathname.match(/\/(youtube|vods|cdn|manual|games)\//)?.[1] ?? 'youtube';

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
  const { data: vod, isLoading } = useVod(tenant!, vodId!);

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

  if (!vod) {
    return <NotFound message="VOD not found" />;
  }

  const renderPlayer = () => {
    switch (routeType) {
      case 'youtube':
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
    <div className="mx-auto flex h-full min-h-0 w-full max-w-full flex-1 flex-col">
      <div className="relative flex h-full min-h-0 flex-1 flex-col">{renderPlayer()}</div>
    </div>
  );
}
