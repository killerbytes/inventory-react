import {
  Customer,
  CustomerInput,
  filterProps,
  PaginatedResponse,
} from "@/schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customerServices } from "@/services";
import { AxiosError } from "axios";

export const customerKeys = {
  all: ["customers"],
  paginated: (filter: filterProps) => [
    ...customerKeys.all,
    "paginated",
    filter,
  ],
};

export const useCustomers = () => {
  return useQuery<Customer[], AxiosError>({
    queryKey: customerKeys.all,
    queryFn: () => customerServices.list(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCustomersPaginated = (filter: filterProps) => {
  return useQuery<PaginatedResponse<Customer>, AxiosError>({
    queryKey: customerKeys.paginated(filter),
    queryFn: () => customerServices.getAll(filter),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newCustomer: CustomerInput) =>
      customerServices.create(newCustomer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CustomerInput }) =>
      customerServices.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => customerServices.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
    },
  });
};
