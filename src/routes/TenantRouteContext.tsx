import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { BlurredBackground } from '@/components/BlurredBackground';
import { TenantContext } from '@/contexts/TenantContext';
import { archiveClient } from '@/utils/archive-client';

export function TenantRouteContext({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isTenantRoute = location.pathname.split('/')[1] !== undefined && location.pathname.split('/')[1] !== '';
  const currentTenant = isTenantRoute ? location.pathname.split('/')[1] : '';

  const { data: tenantRes } = useQuery({
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
    <TenantContext.Provider value={{ tenant: currentTenantData ?? null, cdnEnabled, cdnBaseUrl }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          className="flex flex-1 flex-col overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {isTenantRoute && <BlurredBackground imageUrl={currentTenantData?.background_image_url || null} />}
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex h-full min-h-0 flex-1 flex-col">{children}</div>
          </div>
        </motion.div>
      </AnimatePresence>
    </TenantContext.Provider>
  );
}
