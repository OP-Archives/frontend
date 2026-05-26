import type { ApiResponse, PaginatedApiResponse, PaginatedMeta } from '@/types';

export async function unwrap<T>(promise: Promise<ApiResponse<T>>): Promise<T> {
  const res = await promise;
  if (!res.success) throw new Error(`API error: ${JSON.stringify(res)}`);
  return res.data;
}

export async function unwrapList<T>(
  promise: Promise<PaginatedApiResponse<T>>
): Promise<{ data: T[]; meta: PaginatedMeta }> {
  const res = await promise;
  return { data: res.data, meta: res.meta };
}
