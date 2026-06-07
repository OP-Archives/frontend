import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTenantContext } from '@/contexts/TenantContext';

const staticRouteTitles: Record<string, string> = {
  archive: 'Start Archiving',
  browse: 'Browse Streamers',
  about: 'About Us',
  privacy: 'Privacy Policy',
  tos: 'Terms of Service',
  start: 'Start Archiving',
};

export function TitleManager() {
  const location = useLocation();
  const { tenant: tenantData } = useTenantContext();

  useEffect(() => {
    const isPlayerRoute = /^\/[^/]+\/(youtube|vods|cdn|manual|games)\/[^/]+$/.test(location.pathname);
    if (isPlayerRoute) return;

    const pathParts = location.pathname.split('/').filter(Boolean);

    if (pathParts.length === 0) {
      document.title = 'op archive | Overpowered VOD Archives';
      return;
    }

    const baseRoute = pathParts[0];

    if (staticRouteTitles[baseRoute] && pathParts.length === 1) {
      document.title = `${staticRouteTitles[baseRoute]} - op archive`;
      return;
    }

    const tenantId = baseRoute;
    const routeName = pathParts[1] || '';

    const displayName = tenantData?.display_name || tenantId;

    if (routeName) {
      const pageLabels: Record<string, string> = {
        vods: 'VODs',
        games: 'Games',
        library: 'Library',
        cdn: 'CDN',
        manual: 'Manual',
      };
      document.title = `${displayName} ${pageLabels[routeName] || routeName.charAt(0).toUpperCase() + routeName.slice(1)} - op archive`;
    } else {
      document.title = `${displayName} - op archive`;
    }
  }, [location.pathname, tenantData]);

  return null;
}
