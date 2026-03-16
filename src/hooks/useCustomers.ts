import { useQuery } from "@tanstack/react-query";
import { customerServices } from "@/services";
import { Customer } from "@/schemas";
import { AxiosError } from "axios";

export const useCustomers = () => {
  const query = useQuery<Customer[], AxiosError>({
    queryKey: ["customers"],
    queryFn: () => customerServices.list(),
    staleTime: 1000 * 60 * 5,
  });

  return {
    ...query,
  };
};
