import { useParams } from 'react-router-dom';

export function useTypedParams<T extends Record<string, string>>() {
  const params = useParams<T>();
  return params as T & { [K in keyof T]: T[K] | undefined };
}
