import { useQuery } from '@tanstack/react-query';
import { archiveClient } from '@/utils/archive-client';

export function useRecentVods() {
  return useQuery({
    queryKey: ['vods', 'recent'],
    queryFn: () => archiveClient.vods.recent().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}
