import {
  CancelOrder,
  filterProps,
  OCRForm,
  PaginatedResponse,
  ReturnForm,
  SalesOrder,
  SalesOrderInput,
  Summary,
} from "@/schemas";
import { productCombinationKeys } from "@/features/products/hooks/useProductCombination";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productKeys } from "@/features/products/hooks/useProducts";
import { salesOrderServices } from "@/services";
import { AxiosError } from "axios";

export const salesOrderKeys = {
  all: ["salesOrders"],
  detail: (id: number) => [...salesOrderKeys.all, "detail", id],
  paginated: (filter: filterProps) => [
    ...salesOrderKeys.all,
    "paginated",
    filter,
  ],
  ocr: () => [...salesOrderKeys.all, "ocr"],
  daily: () => [...salesOrderKeys.all, "daily"],
};

export const useSalesOrder = (id: number) => {
  return useQuery<SalesOrder, AxiosError>({
    queryKey: salesOrderKeys.detail(id),
    queryFn: () => salesOrderServices.get(id),
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });
};

export const useSalesOrdersPaginated = (filter: filterProps) => {
  return useQuery<
    PaginatedResponse<
      SalesOrder,
      {
        totalAmount: Summary;
        totalProfitAmount: Summary;
        totalReturnAmount: Summary;
        totalExchangeAmount: Summary;
      }
    >,
    AxiosError
  >({
    queryKey: salesOrderKeys.paginated(filter),
    queryFn: () => salesOrderServices.getAll(filter),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateSalesOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newSalesOrder: SalesOrderInput) =>
      salesOrderServices.create(newSalesOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesOrderKeys.all });
      queryClient.invalidateQueries({ queryKey: productCombinationKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};

export const useUpdateSalesOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SalesOrderInput }) =>
      salesOrderServices.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesOrderKeys.all });
      queryClient.invalidateQueries({ queryKey: productCombinationKeys.all });
    },
  });
};

export const useCancelSalesOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CancelOrder }) =>
      salesOrderServices.cancel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesOrderKeys.all });
      queryClient.invalidateQueries({ queryKey: productCombinationKeys.all });
    },
  });
};

export const useDeleteSalesOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => salesOrderServices.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesOrderKeys.all });
    },
  });
};

export const useCreateReturnExchange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ReturnForm }) =>
      salesOrderServices.returnExchange(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesOrderKeys.all });
      queryClient.invalidateQueries({ queryKey: productCombinationKeys.all });
    },
  });
};

export const useOCR = () => {
  return useMutation<OCRForm, AxiosError, FormData>({
    mutationFn: (data: FormData) => salesOrderServices.ocr(data),
  });
};

export const useDailySalesOrder = () => {
  return useQuery<
    {
      name: string;
      totalAmount: number;
    }[],
    AxiosError
  >({
    queryKey: salesOrderKeys.all,
    queryFn: () => salesOrderServices.dailySales(),
    staleTime: 1000 * 60 * 5,
  });
};
