import { createContext, useContext } from 'react';
import type { Tenant } from '@/types';

interface TenantContextValue {
  tenant: Tenant | null;
  cdnEnabled: boolean;
  cdnBaseUrl: string;
  isLoading: boolean;
}

export const TenantContext = createContext<TenantContextValue>({
  tenant: null,
  cdnEnabled: false,
  cdnBaseUrl: '',
  isLoading: false,
});

export function useTenantContext(): TenantContextValue {
  return useContext(TenantContext);
}
