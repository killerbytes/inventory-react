import { useQuery } from "@tanstack/react-query";
import { authServices } from "@/services";

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: authServices.me,
    staleTime: 1000 * 60 * 5, // Keep data fresh for 5 mins
  });
};
