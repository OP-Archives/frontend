import type { ApiResponse } from '@/types';

export async function unwrap<T>(promise: Promise<ApiResponse<T>>): Promise<T> {
  const res = await promise;
  if (!res.success) throw new Error(`API error: ${JSON.stringify(res)}`);
  return res.data;
}
