import {
  BreakPackInput,
  ProductCombination,
  ProductCombinationInput,
  StockAdjustment,
  VariantTypes,
} from "@/schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productCombinationServices } from "@/services";
import { productKeys } from "./useProducts";
import { AxiosError } from "axios";

export const productCombinationKeys = {
  all: ["product-combination"],
  get: (id: number) => ["product-combination", id],
};

export const useProductCombination = (id: number) => {
  return useQuery<ProductCombination, AxiosError>({
    queryKey: productCombinationKeys.get(id),
    queryFn: () => productCombinationServices.get(id),
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });
};

export const useProductCombinationByProductId = (id: number) => {
  return useQuery<
    {
      combinations: ProductCombination[];
      variants: VariantTypes[];
    },
    AxiosError
  >({
    queryKey: productCombinationKeys.all,
    queryFn: () => productCombinationServices.getByProductId(id),
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });
};

export const useUpdateProductCombination = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: number;
      data: ProductCombinationInput[];
    }) => productCombinationServices.updateByProductId(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: productCombinationKeys.all });
    },
  });
};

export const useCreateBreakPack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ values }: { values: BreakPackInput }) =>
      productCombinationServices.breakPack(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productCombinationKeys.all });
    },
  });
};

export const useCreateStockAdjustment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ values }: { values: StockAdjustment }) => {
      return productCombinationServices.stockAdjustment(values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productCombinationKeys.all });
    },
  });
};
