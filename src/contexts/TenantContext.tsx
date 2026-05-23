import { createContext, useContext } from 'react';
import type { Tenant } from '@/types';

interface TenantContextValue {
  tenant: Tenant | null;
  cdnEnabled: boolean;
  cdnBaseUrl: string;
}

export const TenantContext = createContext<TenantContextValue>({
  tenant: null,
  cdnEnabled: false,
  cdnBaseUrl: '',
});

export function useTenantContext(): TenantContextValue {
  return useContext(TenantContext);
}
