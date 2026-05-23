import { ArrowRight } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { TwitchIcon, KickIcon } from '@/assets/icons';
//import heroImage from '@/assets/shigure-ui.gif';
import { BlurredBackground } from '@/components/BlurredBackground';
import { Loading } from '@/utils/Loading';
import { PaginationControls } from '@/utils/PaginationControls';
import { useTenants } from '@/utils/useTenants';

const platformConfig: Record<string, { icon: typeof TwitchIcon; color: string }> = {
  twitch: { icon: TwitchIcon, color: '#9146FF' },
  kick: { icon: KickIcon, color: '#53fc18' },
};

export function Landing() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const page = parseInt(searchParams.get('page') || '1') || 1;
  const pageSize = 20;

  const {
    data: tenantsData,
    isLoading,
    error,
  } = useTenants({
    page: String(page),
    limit: String(pageSize),
  });
  const tenants = tenantsData?.data;
  const meta = tenantsData?.meta;
  const totalPages = Math.max(Math.ceil((meta?.total || 0) / pageSize), 1);

  return (
    <div className="relative">
      <BlurredBackground />

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center pt-16 sm:pt-20 md:pt-24">
          {/* Character 
          <img src={heroImage} alt="" className="h-[140px] w-auto object-contain md:h-[200px]" />
          */}

          {/* Title + Subtitle + Underline */}
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-[#f0f0f5] sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="mr-3 text-[#6366f1] md:mr-4">op</span>
              <span className="text-[#f0f0f5]">archive</span>
            </h1>
            <p className="mt-3 text-sm text-[#9ca3af]">
              A platform for watching your favorite streamers' archived VODs
            </p>
            <div className="mx-auto mt-4 h-[1.5px] w-48 bg-[#6366f1]/40" />
          </div>

          {/* Tenant Grid */}
          {isLoading ? (
            <div className="mt-8 flex min-h-[200px] items-center justify-center">
              <Loading />
            </div>
          ) : error ? (
            <div className="mt-8 text-center">
              <p className="text-[#6366f1]">Failed to load</p>
              <p className="mt-1 text-sm text-[#9ca3af]">{error instanceof Error ? error.message : 'Unknown error'}</p>
            </div>
          ) : (
            <div className="mt-8 grid w-full max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {tenants?.map(
                (tenant: {
                  id: string;
                  display_name: string;
                  profile_image_url: string;
                  status: string;
                  platforms: { name: string; enabled: boolean; id: string | null }[];
                }) => (
                  <div
                    key={tenant.id}
                    onClick={(e) => {
                      if (e.target instanceof HTMLElement && e.target.closest('a')) return;
                      navigate(`/${tenant.id}/vods`);
                    }}
                    className="group flex cursor-pointer items-start gap-3 rounded-md border border-transparent bg-[#16161e]/80 p-3 backdrop-blur-sm transition-all hover:border-[#222230] hover:bg-[#16161e]"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#222230]">
                      {tenant.profile_image_url ? (
                        <img
                          src={tenant.profile_image_url}
                          alt={tenant.display_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-[#9ca3af]">
                          {tenant.display_name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          <p className="truncate text-sm font-medium text-[#f0f0f5] group-hover:text-[#6366f1]">
                            {tenant.display_name}
                          </p>
                          <span
                            className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium ${tenant.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#1e1e26] text-[#6b7280]'}`}
                          >
                            {tenant.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <ArrowRight className="h-4 w-4 flex-shrink-0 text-[#9ca3af] transition-colors group-hover:text-[#6366f1]" />
                      </div>

                      {tenant.platforms.filter((p) => p.enabled).length > 0 && (
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          {tenant.platforms
                            .filter((p) => p.enabled)
                            .map(({ name }) => {
                              const config = platformConfig[name];
                              if (!config) return null;
                              const Icon = config.icon;
                              return (
                                <span key={name} className="rounded-full bg-[#222230] p-1.5" title={name}>
                                  <Icon className="h-3 w-3" style={{ color: config.color }} />
                                </span>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {(!tenants || tenants.length === 0) && !isLoading && (
            <div className="py-12 text-center">
              <p className="text-[#9ca3af]">No streamers found</p>
            </div>
          )}

          <div className="py-6">
            <PaginationControls page={meta?.page || 1} totalPages={totalPages} />
          </div>
        </div>
      </div>
    </div>
  );
}
