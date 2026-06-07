import VodCard from './VodCard';
import type { VodListItem } from '@/types';

interface VodsGridProps {
  vods: VodListItem[] | null;
  isLoading: boolean;
  limit: number;
}

export function VodsGrid({ vods, isLoading, limit }: VodsGridProps) {
  if (isLoading) {
    return (
      <div className="mx-auto mt-2 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="block w-full min-w-0">
            <div className="relative aspect-video w-full overflow-hidden bg-[#16161e]">
              <div className="absolute inset-0 animate-pulse bg-[#222230]" />
              <div className="absolute top-2 left-2">
                <span className="inline-flex items-center gap-1 rounded bg-[#222230] px-2 py-0.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#9ca3af]" />
                </span>
              </div>
              <div className="absolute top-2 right-2">
                <span className="inline-flex items-center justify-center rounded-md bg-[#222230] p-1">
                  <span className="h-5 w-5 animate-pulse" />
                </span>
              </div>
              <div className="absolute bottom-0 left-0">
                <span className="bg-[#222230] p-1.5 text-xs">
                  <span className="block h-[16px] w-[50px] animate-pulse rounded" />
                </span>
              </div>
              <div className="absolute right-0 bottom-0">
                <span className="bg-[#222230] p-1.5 text-xs">
                  <span className="block h-[16px] w-[30px] animate-pulse rounded" />
                </span>
              </div>
            </div>
            <div className="mt-1 mb-1 flex items-center">
              <div className="shrink-0">
                <div className="h-[53px] w-[40px] animate-pulse rounded-sm bg-[#222230]" />
              </div>
              <div className="min-w-0 flex-1 pl-2">
                <div className="w-full min-w-0 p-0.5">
                  <span className="block animate-pulse truncate rounded bg-[#6366f1]/30 text-xs font-medium">
                    &nbsp;
                  </span>
                </div>
                <div className="mt-0.5 flex justify-center">
                  <span className="inline-flex animate-pulse cursor-pointer items-center gap-1 rounded border border-[#6366f1] px-3 py-1 font-semibold text-[#6366f1] transition-colors hover:bg-[#6366f1]/10">
                    <span className="block h-[16px] w-4 animate-pulse rounded bg-[#6366f1]/30" /> Watch
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (vods && vods.length === 0) {
    return <p className="mt-12 text-center text-sm text-[#9ca3af]">No VODs found matching your search filters.</p>;
  }

  if (vods && vods.length > 0) {
    return (
      <div className="mx-auto mt-2 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {vods.map((vod: VodListItem, index: number) => (
          <div key={vod.id}>
            <VodCard vod={vod} priority={index < 10} />
          </div>
        ))}
      </div>
    );
  }

  return null;
}
