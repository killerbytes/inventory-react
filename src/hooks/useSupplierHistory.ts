import { useQuery } from "@tanstack/react-query";
import { supplierServices } from "@/services";
import { SupplierHistory } from "@/schemas";
import { AxiosError } from "axios";

export const useSupplierHistory = (productId: number) => {
  return useQuery<SupplierHistory[], AxiosError>({
    queryKey: ["supplier-history", productId],
    queryFn: () => supplierServices.getByProductId(productId),
    staleTime: 1000 * 60 * 5,
  });
};
