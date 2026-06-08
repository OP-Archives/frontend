import { useLocation, Outlet } from 'react-router-dom';
import { AdsenseBanner } from '@/components/AdsenseBanner';
import type { Tenant } from '@/types';
import { Vods } from '@/vods/Vods';

interface NoContentProps {
  tenantData: Tenant;
}

function NoContent({ tenantData }: NoContentProps) {
  if (!tenantData?.games && tenantData?.vods !== false) {
    return <Vods />;
  }
  return (
    <div className="mt-12 flex justify-center">
      <div className="rounded-lg border border-[#222230] bg-[#16161e]/80 px-6 py-3">
        <p className="text-center text-sm text-[#9ca3af]">No content available for this tenant.</p>
      </div>
    </div>
  );
}

export function TenantContent({ tenantData }: { tenantData: Tenant }) {
  const location = useLocation();
  const currentPath = location.pathname;

  const isOnGames = currentPath === `/${tenantData?.id}/games`;

  if (isOnGames && !tenantData?.games) {
    return <NoContent tenantData={tenantData} />;
  }

  const isPlayerRoute = /^\/[^/]+\/(youtube|vods|cdn|manual|games)\/[^/]+$/.test(currentPath);

  if (isPlayerRoute) {
    return (
      <div className="flex min-h-0 w-full flex-1 flex-col">
        <Outlet />
      </div>
    );
  }

  return (
    <>
      <AdsenseBanner />
      <Outlet />
    </>
  );
}
