import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenantContext } from '@/contexts/TenantContext';

export function TenantIndex() {
  const navigate = useNavigate();
  const { tenant: tenantData } = useTenantContext();

  useEffect(() => {
    if (!tenantData) return;

    if (tenantData?.vods !== false) {
      navigate(`/${tenantData.id}/vods`, { replace: true });
      return;
    }

    if (tenantData?.games) {
      navigate(`/${tenantData.id}/games`, { replace: true });
      return;
    }
  }, [tenantData, navigate]);

  if (tenantData?.vods !== false || tenantData?.games) {
    return null;
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#6366f1]">404</h1>
        <p className="mt-4 text-xl text-[#9ca3af]">Nothing is available at the time.</p>
      </div>
    </div>
  );
}
