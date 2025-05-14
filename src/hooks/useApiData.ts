import { useState, useCallback, useRef } from "react";

export function useApiData() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cache object to store fetched data by key
  const cache = useRef<Record<string, object>>({});

  const fetchData = useCallback(
    async (key: string, fetchFn: () => Promise<unknown>): Promise<void> => {
      // If data is already in cache, return it
      if (cache.current[key]) {
        setData((prev: Record<string, unknown>) => ({
          ...prev,
          [key]: cache.current[key],
        }));
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await fetchFn();
        cache.current[key] = result as object; // Store in cache
        setData((prev: Record<string, unknown>) => ({
          ...prev,
          [key]: result,
        }));
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const invalidate = (key: string) => {
    console.log(cache.current);

    if (cache.current[key]) {
      delete cache.current[key];
    }
  };

  const value = {
    store: data,
    loading,
    error,
    fetchData,
    invalidate,
  };

  return value;
}

export interface ApiDataType {
  store: Record<string, object>;
  loading: boolean;
  error: null;
  fetchData: (key: string, fetchFn: () => Promise<object>) => Promise<void>;
  invalidate: (key: string) => void;
}
