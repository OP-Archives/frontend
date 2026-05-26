import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { BlurredBackground } from '@/components/BlurredBackground';
import { TenantContext } from '@/contexts/TenantContext';
import { pageTransition } from '@/motion/variants';
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

  return (
    <TenantContext.Provider value={{ tenant: currentTenantData ?? null, cdnEnabled, cdnBaseUrl, isLoading }}>
      {isPlayerRoute ? (
        <div className="flex flex-1 flex-col overflow-hidden">
          {isTenantRoute && <BlurredBackground imageUrl={currentTenantData?.background_image_url || null} />}
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex h-full min-h-0 flex-1 flex-col">{children}</div>
          </div>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div key={location.pathname} className="flex flex-1 flex-col overflow-hidden" {...pageTransition}>
            {isTenantRoute && <BlurredBackground imageUrl={currentTenantData?.background_image_url || null} />}
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex h-full min-h-0 flex-1 flex-col">{children}</div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </TenantContext.Provider>
  );
}
