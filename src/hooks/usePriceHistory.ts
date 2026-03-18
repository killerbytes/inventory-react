import { filterProps, PaginatedResponse, PriceHistory } from "@/schemas";
import { useQuery } from "@tanstack/react-query";
import { inventoryServices } from "@/services";
import { AxiosError } from "axios";

export const usePriceHistory = (filter: filterProps) => {
  return useQuery<PaginatedResponse<PriceHistory>, AxiosError>({
    queryKey: ["price-history", filter],
    queryFn: () => inventoryServices.getPriceHistory(filter),
    staleTime: 1000 * 60 * 5,
  });
};
