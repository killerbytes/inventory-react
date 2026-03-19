import {
  filterProps,
  PaginatedResponse,
  Supplier,
  SupplierInput,
} from "@/schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supplierServices } from "@/services";
import { AxiosError } from "axios";

export const supplierKeys = {
  all: ["suppliers"],
  detail: (id: number) => [...supplierKeys.all, "detail", id],
  paginated: (filter: filterProps) => [
    ...supplierKeys.all,
    "paginated",
    filter,
  ],
};

export const useSuppliers = () => {
  return useQuery<Supplier[], AxiosError>({
    queryKey: supplierKeys.all,
    queryFn: () => supplierServices.list(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useSupplier = (id: number) => {
  return useQuery<Supplier, AxiosError>({
    queryKey: supplierKeys.detail(id),
    queryFn: () => supplierServices.get(id),
    staleTime: 1000 * 60 * 5,
  });
};

export const useSuppliersPaginated = (filter: filterProps) => {
  return useQuery<PaginatedResponse<Supplier>, AxiosError>({
    queryKey: supplierKeys.paginated(filter),
    queryFn: () => supplierServices.getAll(filter),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newSupplier: SupplierInput) =>
      supplierServices.create(newSupplier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.all });
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SupplierInput }) =>
      supplierServices.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.all });
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => supplierServices.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.all });
    },
  });
};
