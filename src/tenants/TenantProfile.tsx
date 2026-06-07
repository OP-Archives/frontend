import { Helmet } from 'react-helmet-async';
import { useParams, useLocation } from 'react-router-dom';
import { TenantContent } from './TenantContent';
import { TenantProfileCard } from './TenantProfileCard';
import { TenantTabs } from './TenantTabs';
import { Background } from '@/components/Background';
import { Loading } from '@/components/ui/Loading';
import { NotFound } from '@/components/ui/NotFound';
import { useTenantContext } from '@/contexts/TenantContext';

export function TenantProfile() {
  const { tenant } = useParams<{ tenant: string }>();
  const location = useLocation();
  const { tenant: tenantData, isLoading, isTenantNotFound } = useTenantContext();

  const hasContent = tenantData?.vods || tenantData?.games;

  const tabs = [
    { label: 'VODs', path: `/${tenant}`, visible: tenantData?.vods !== false },
    { label: 'Games', path: `/${tenant}/games`, visible: !!tenantData?.games },
    { label: 'Library', path: `/${tenant}/library`, visible: !!hasContent },
  ];

  const isPlayerRoute = /^\/[^/]+\/(youtube|vods|cdn|manual|games)\/[^/]+$/.test(location.pathname);

  if (isTenantNotFound && !tenantData) {
    return (
      <div className="flex min-h-0 w-full flex-1 flex-col">
        <div className="mx-auto w-full max-w-[1800px] py-8">
          <NotFound message="Streamer not found" backToHome />
        </div>
      </div>
    );
  }

  if (isLoading || !tenantData) {
    return (
      <div className="flex min-h-0 w-full flex-1 flex-col">
        <div className={`mx-auto w-full max-w-[1800px] py-8 ${isPlayerRoute ? 'hidden' : ''}`}>
          <div className="flex w-full flex-col items-center text-center">
            <div className="relative aspect-[6/1] w-full animate-pulse overflow-hidden rounded-lg bg-[#222230]" />
          </div>
          <div className="mt-6 flex gap-4 border-b border-[#222230] px-4 pb-2">
            <div className="h-6 w-16 animate-pulse rounded bg-[#222230]" />
            <div className="h-6 w-16 animate-pulse rounded bg-[#222230]" />
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex h-full min-h-0 flex-1 flex-col">
            <div className="mx-auto w-full max-w-[1800px]">
              {isPlayerRoute ? (
                <div className="flex min-h-0 w-full flex-1 flex-col lg:flex-row">
                  <div className="flex w-full flex-1 flex-col">
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                      <div className="absolute inset-0 flex items-center justify-center bg-[#09090b]">
                        <div className="h-6 w-6 animate-spin rounded-full border-[2px] border-[#6366f1] border-t-transparent" />
                      </div>
                    </div>
                  </div>
                  <div className="hidden w-full border-l border-[#222230] lg:block lg:w-[340px]">
                    <div className="h-8 border-b border-[#222230] bg-[#16161e]">
                      <div className="mx-3 mt-2 h-3 w-20 animate-pulse rounded bg-[#222230]" />
                    </div>
                    <div className="h-px bg-[#222230]" />
                    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-3">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className="mb-2 flex items-start gap-2">
                          <div className="h-2 w-12 animate-pulse rounded bg-[#222230]" />
                          <div className="flex-1">
                            <div className="h-2 w-full animate-pulse rounded bg-[#222230]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 flex items-center justify-center">
                  <Loading />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayName = tenantData.display_name;
  const profileImage = tenantData.profile_image_url;

  return (
    <>
      <Background imageUrl={tenantData.background_image_url} />
      <Helmet>
        <title>{displayName} - op archive</title>
        <link rel="canonical" href={`https://overpowered.tv/${tenant}`} />
        <meta
          name="description"
          content={`${displayName}'s archived Twitch & Kick VODs with full chat replay on op archive`}
        />
        <meta property="og:title" content={`${displayName} - op archive`} />
        <meta
          property="og:description"
          content={`Watch ${displayName}'s archived Twitch and Kick VODs with full chat replay and emotes on op archive.`}
        />
        {profileImage && <meta property="og:image" content={profileImage} />}
        <meta name="twitter:title" content={`${displayName} - op archive`} />
        <meta
          name="twitter:description"
          content={`Watch ${displayName}'s archived Twitch and Kick VODs with full chat replay and emotes on op archive.`}
        />
        {profileImage && <meta name="twitter:image" content={profileImage} />}
      </Helmet>
      <div className="flex min-h-0 w-full flex-1 flex-col">
        <div className={`mx-auto w-full max-w-[1800px] py-8 ${isPlayerRoute ? 'hidden' : ''}`}>
          <TenantProfileCard tenantData={tenantData} centered={true} />
          <TenantTabs tabs={tabs} />
        </div>
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex h-full min-h-0 flex-1 flex-col">
            <TenantContent tenantData={tenantData} />
          </div>
        </div>
      </div>
    </>
  );
}
