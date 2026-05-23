import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import CustomVod from '@/components/player/CustomVod';
import Games from '@/components/player/Games';
import YoutubeVod from '@/components/player/YoutubeVod';
import { useTenantContext } from '@/contexts/TenantContext';
import { Loading } from '@/utils/Loading';
import { NotFound } from '@/utils/NotFound';
import { useVod } from '@/utils/useVods';

export function Vod() {
  const params = useParams<{ tenant: string; vodId: string }>();
  const tenant = params.tenant;
  const vodId = params.vodId;
  const location = useLocation();
  const navigate = useNavigate();
  const pathParts = location.pathname.split('/');
  const routeType = pathParts[pathParts.length - 2]; // vods, cdn, manual, games

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.history.back();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const { cdnBaseUrl } = useTenantContext();
  const { data: vod, isLoading, error } = useVod(tenant!, vodId!);

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

  if (error) {
    navigate(`/${tenant}`, { replace: true });
    return null;
  }

  if (!vod) {
    return <NotFound />;
  }

  const renderPlayer = () => {
    switch (routeType) {
      case 'vods':
        return <YoutubeVod />;
      case 'cdn':
        return <CustomVod type="cdn" cdnBase={cdnBaseUrl} />;
      case 'manual':
        return <CustomVod />;
      case 'games':
        return <Games />;
      default:
        return <YoutubeVod />;
    }
  };

  return (
    <div className="mx-auto max-w-[1920px]">
      <div className="relative">{renderPlayer()}</div>

      {vod.prev?.[0] && vod.next?.[0] && (
        <div className="flex items-center justify-between border-t border-[#222230] px-4 py-3">
          <button className="flex items-center gap-2 text-[#9ca3af] transition-colors hover:text-[#f0f0f5]">
            <ChevronLeft className="h-4 w-4" />
            <span className="text-sm">Previous</span>
          </button>
          <button className="flex items-center gap-2 text-[#9ca3af] transition-colors hover:text-[#f0f0f5]">
            <span className="text-sm">Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
