import { createContext, useContext } from 'react';
import type { Tenant } from '@/types';

interface TenantContextValue {
  tenant: Tenant | null;
  cdnEnabled: boolean;
  cdnBaseUrl: string;
  isLoading: boolean;
  isTenantNotFound: boolean;
}

export const TenantContext = createContext<TenantContextValue>({
  tenant: null,
  cdnEnabled: false,
  cdnBaseUrl: '',
  isLoading: false,
  isTenantNotFound: false,
});

export function useTenantContext(): TenantContextValue {
  return useContext(TenantContext);
}
