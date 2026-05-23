import { useQuery } from '@tanstack/react-query';
import { archiveClient } from '@/utils/archive-client';

export function useTenants(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['tenants', params],
    queryFn: async () => {
      const result = await archiveClient.tenants.list(params);
      return {
        data: result.data,
        meta: result.meta,
      };
    },
    enabled: true,
  });
}
