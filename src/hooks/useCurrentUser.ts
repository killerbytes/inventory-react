import { useQuery } from "@tanstack/react-query";
import { authServices } from "@/services";
import { useStore } from "@/stores";

export const useCurrentUser = () => {
  const token = useStore(s => s.authState.token);

  return useQuery({
    queryKey: ["current-user"],
    queryFn: authServices.me,
    staleTime: 1000 * 60 * 5, // Keep data fresh for 5 mins
    enabled: !!token,
    retry: false,
  });
};
