import type { ApiDataType } from "@/hooks/useApiData";
import { createContext } from "react";

export const GlobalContext = createContext<ApiDataType | null>({
  store: {},
  loading: false,
  error: null,
  fetchData: async (key: string, fetchFn: () => Promise<object>) => {
    await fetchFn();
  },
  invalidate: () => {},
});
