import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { filterProps, VariantTypes } from "@/schemas";
import { variantTypesServices } from "@/services";
import { productKeys } from "./useProducts";
import { AxiosError } from "axios";

export const variantKeys = {
  all: ["variants"],
  detail: (id: number) => [...variantKeys.all, "detail", id],
  paginated: (filter: filterProps) => [...variantKeys.all, "paginated", filter],
};

export const useVariantType = (id: number) => {
  return useQuery<VariantTypes[], AxiosError>({
    queryKey: variantKeys.detail(id),
    queryFn: () => variantTypesServices.get(id),
    staleTime: 1000 * 60 * 5,
  });
};

export const useVariants = () => {
  return useQuery<VariantTypes[], AxiosError>({
    queryKey: variantKeys.all,
    queryFn: () => variantTypesServices.list(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateVariantType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newVariantType: VariantTypes) =>
      variantTypesServices.create(newVariantType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: variantKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};

export const useUpdateVariantType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: VariantTypes }) =>
      variantTypesServices.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: variantKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};

export const useDeleteVariantType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => variantTypesServices.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: variantKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};
