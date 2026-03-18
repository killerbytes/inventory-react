import { useQuery } from "@tanstack/react-query";
import { supplierServices } from "@/services";
import { Supplier } from "@/schemas";
import { AxiosError } from "axios";

export const useSuppliers = () => {
  const query = useQuery<Supplier[], AxiosError>({
    queryKey: ["suppliers"],
    queryFn: () => supplierServices.list(),
    staleTime: 1000 * 60 * 5,
  });

  return {
    ...query,
  };
};
