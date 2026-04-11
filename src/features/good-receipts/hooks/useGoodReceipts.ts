import {
  filterProps,
  GoodReceipt,
  GoodReceiptInput,
  PaginatedResponse,
  ReturnForm,
} from "@/schemas";
import { productCombinationKeys } from "@/features/products/hooks/useProductCombination";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productKeys } from "@/features/products/hooks/useProducts";
import { goodReceiptServices } from "@/services";
import { AxiosError } from "axios";

export const goodReceiptKeys = {
  all: ["goodReceipts"],
  detail: (id: number) => [...goodReceiptKeys.all, "detail", id],
  paginated: (filter: filterProps) => [
    ...goodReceiptKeys.all,
    "paginated",
    filter,
  ],
};

export const useGoodReceipt = (id: number) => {
  return useQuery<GoodReceipt, AxiosError>({
    queryKey: goodReceiptKeys.detail(id),
    queryFn: () => goodReceiptServices.get(id),
    staleTime: 1000 * 60 * 5,
  });
};

export const useGoodReceiptsPaginated = (filter: filterProps) => {
  return useQuery<PaginatedResponse<GoodReceipt>, AxiosError>({
    queryKey: goodReceiptKeys.paginated(filter),
    queryFn: () => goodReceiptServices.getAll(filter),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateGoodReceipt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newGoodReceipt: GoodReceiptInput) =>
      goodReceiptServices.create(newGoodReceipt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goodReceiptKeys.all });
    },
  });
};

export const useUpdateGoodReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: GoodReceiptInput }) =>
      goodReceiptServices.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goodReceiptKeys.all });
      queryClient.invalidateQueries({ queryKey: productCombinationKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};

export const useDeleteGoodReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => goodReceiptServices.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goodReceiptKeys.all });
    },
  });
};

export const useCreateSupplierReturns = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ReturnForm }) =>
      goodReceiptServices.supplierReturns(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goodReceiptKeys.all });
      queryClient.invalidateQueries({ queryKey: productCombinationKeys.all });
    },
  });
};
