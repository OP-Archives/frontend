import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTenantContext } from '@/contexts/TenantContext';

export function TitleManager() {
  const location = useLocation();
  const { tenant: tenantData } = useTenantContext();

  useEffect(() => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const tenantId = pathParts[0] || '';
    const routeName = pathParts[1] || '';
    const vodId = pathParts[2] || '';

    const displayName = tenantData?.display_name || tenantId;

    if (!tenantId) {
      if (routeName === 'about') {
        document.title = 'About';
      } else {
        document.title = 'op archive';
      }
    } else if (vodId) {
      document.title = `${vodId} - ${displayName}`;
    } else if (routeName) {
      const pageLabels: Record<string, string> = {
        vods: 'VODs',
        games: 'Games',
        library: 'Library',
        cdn: 'CDN',
        manual: 'Manual',
      };
      document.title = `${displayName} - ${pageLabels[routeName] || routeName.charAt(0).toUpperCase() + routeName.slice(1)}`;
    } else {
      document.title = displayName;
    }
  }, [location.pathname, tenantData]);

  return null;
}
