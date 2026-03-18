import {
  filterProps,
  PaginatedResponse,
  Product,
  ProductInput,
  ProductWithCombinations,
} from "@/schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productCombinationKeys } from "./useProductCombination";
import { productServices } from "@/services";
import { AxiosError } from "axios";

export const productKeys = {
  all: ["products"],
  detail: (id: number) => [...productKeys.all, "detail", id],
  paginated: (filter: filterProps) => [...productKeys.all, "paginated", filter],
};

export const useProducts = () => {
  return useQuery<Product[], AxiosError>({
    queryKey: productKeys.all,
    queryFn: () => productServices.list(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useProduct = (id: number) => {
  return useQuery<ProductWithCombinations, AxiosError>({
    queryKey: productKeys.detail(id),
    queryFn: () => productServices.get(id),
    staleTime: 1000 * 60 * 5,
  });
};

export const useProductsPaginated = (filter: filterProps) => {
  return useQuery<PaginatedResponse<Product>, AxiosError>({
    queryKey: productKeys.paginated(filter),
    queryFn: () => productServices.getAll(filter),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newProduct: ProductInput) =>
      productServices.create(newProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductInput }) =>
      productServices.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: productCombinationKeys.all });
    },
  });
};
