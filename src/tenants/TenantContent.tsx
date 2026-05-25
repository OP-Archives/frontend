import { useLocation, Outlet } from 'react-router-dom';
import { Games } from '@/games/Games';
import type { Tenant } from '@/types';
import { Vods } from '@/vods/Vods';

interface NoContentProps {
  tenantData: Tenant;
}

function NoContent({ tenantData }: NoContentProps) {
  if (tenantData?.vods === false && tenantData?.games) {
    return <Games />;
  }
  if (!tenantData?.games && tenantData?.vods !== false) {
    return <Vods />;
  }
  return (
    <div className="mt-12 text-center">
      <p className="text-sm text-[#9ca3af]">No content available for this tenant.</p>
    </div>
  );
}

export function TenantContent({ tenantData }: { tenantData: Tenant }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const tenant = tenantData?.id || '';

  const isOnVods = currentPath === `/${tenant}`;
  const isOnGames = currentPath === `/${tenant}/games`;

  if (isOnVods && tenantData?.vods === false) {
    return <NoContent tenantData={tenantData} />;
  }

  if (isOnGames && !tenantData?.games) {
    return <NoContent tenantData={tenantData} />;
  }

  const isPlayerRoute = /^\/[^/]+\/(vods|cdn|manual|games)\/[^/]+$/.test(currentPath);

  if (isPlayerRoute) {
    return (
      <div className="flex min-h-0 w-full flex-1 flex-col">
        <Outlet />
      </div>
    );
  }

  return <Outlet />;
}
