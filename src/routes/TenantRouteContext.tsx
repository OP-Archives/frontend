import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { Background } from '@/components/Background';
import { TenantContext } from '@/contexts/TenantContext';
import { archiveClient } from '@/utils/archive-client';

export function TenantRouteContext({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isTenantRoute = location.pathname.split('/')[1] !== undefined && location.pathname.split('/')[1] !== '';
  const currentTenant = isTenantRoute ? location.pathname.split('/')[1] : '';
  const isPlayerRoute = /^\/[^/]+\/(vods|cdn|manual|games)\/[^/]+$/.test(location.pathname);

  const { data: tenantRes, isLoading } = useQuery({
    queryKey: ['tenant', currentTenant],
    queryFn: () => archiveClient.tenants.get(currentTenant),
    enabled: !!currentTenant,
    staleTime: 5 * 60 * 1000,
    retry: 0,
  });

  const currentTenantData = tenantRes?.data;
  const cdnEnabled = currentTenantData?.cdn?.enabled ?? false;
  const rawCdnUrl = currentTenantData?.cdn?.baseUrl ?? '';
  const cdnBaseUrl = rawCdnUrl && !rawCdnUrl.startsWith('http') ? `https://${rawCdnUrl}` : rawCdnUrl;

  const isListRoute = /^\/[^/]+\/(vods|games|library)(\/)?$/.test(location.pathname);
  const isPlayerRouteInTenant = isPlayerRoute && isTenantRoute;
  const routeKey = isPlayerRouteInTenant ? 'player' : isListRoute ? 'list' : 'tenant';

  return (
    <TenantContext.Provider value={{ tenant: currentTenantData ?? null, cdnEnabled, cdnBaseUrl, isLoading }}>
      <div key={routeKey} className="flex flex-1 flex-col overflow-hidden">
        {isTenantRoute && <Background imageUrl={currentTenantData?.background_image_url || null} />}
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex h-full min-h-0 flex-1 flex-col">{children}</div>
        </div>
      </div>
    </TenantContext.Provider>
  );
}
