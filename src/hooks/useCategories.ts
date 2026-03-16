import { useQuery } from "@tanstack/react-query";
import { categoryServices } from "@/services";
import { Category } from "@/schemas";
import { AxiosError } from "axios";

export const useCategories = () => {
  const query = useQuery<Category[], AxiosError>({
    queryKey: ["categories"],
    queryFn: () => categoryServices.list(),
    staleTime: 1000 * 60 * 5,
  });

  return {
    ...query,
  };
};
