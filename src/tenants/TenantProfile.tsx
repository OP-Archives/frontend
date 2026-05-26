import { useLayoutEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { TenantContent } from './TenantContent';
import { TenantProfileCard } from './TenantProfileCard';
import { TenantTabs } from './TenantTabs';
import { Loading } from '@/components/ui/Loading';
import { useTenantContext } from '@/contexts/TenantContext';

export function TenantProfile() {
  const navigate = useNavigate();
  const { tenant } = useParams<{ tenant: string }>();
  const location = useLocation();
  const { tenant: tenantData, isLoading } = useTenantContext();

  const hasContent = tenantData?.vods || tenantData?.games;

  const tabs = [
    { label: 'VODs', path: `/${tenant}`, visible: tenantData?.vods !== false },
    { label: 'Games', path: `/${tenant}/games`, visible: !!tenantData?.games },
    { label: 'Library', path: `/${tenant}/library`, visible: !!hasContent },
  ];

  const isIndexRoute = location.pathname === `/${tenant}`;

  useLayoutEffect(() => {
    if (isIndexRoute && !isLoading && tenantData) {
      if (tenantData?.vods) {
        navigate('vods', { replace: true });
      } else if (tenantData?.games) {
        navigate('games', { replace: true });
      }
    }
  }, [isIndexRoute, navigate, tenantData?.vods, tenantData?.games, isLoading]);

  if (isLoading || !tenantData) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loading />
      </div>
    );
  }

  const isPlayerRoute = /^\/[^/]+\/(vods|cdn|manual|games)\/[^/]+$/.test(location.pathname);

  if (isPlayerRoute) {
    return (
      <div className="flex min-h-0 w-full flex-1 flex-col">
        <TenantContent tenantData={tenantData} />
      </div>
    );
  }

  return (
    <div className="py-8">
      <TenantProfileCard tenantData={tenantData} centered={true} />
      <TenantTabs tabs={tabs} />
      <div className="mt-6">
        <TenantContent tenantData={tenantData} />
      </div>
    </div>
  );
}
