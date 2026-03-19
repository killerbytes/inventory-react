import {
  filterProps,
  GoodReceipt,
  Invoice,
  InvoiceInput,
  PaginatedResponse,
} from "@/schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { goodReceiptServices, invoiceServices } from "@/services";
import { AxiosError } from "axios";

export const invoiceKeys = {
  all: ["invoices"],
  detail: (id: number) => [...invoiceKeys.all, "detail", id],
  paginated: (filter: filterProps) => [...invoiceKeys.all, "paginated", filter],
};

export const useInvoice = (id: number) => {
  return useQuery<Invoice, AxiosError>({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => invoiceServices.get(id),
    staleTime: 1000 * 60 * 5,
  });
};

export const useInvoicesPaginated = (filter: filterProps) => {
  return useQuery<PaginatedResponse<Invoice>, AxiosError>({
    queryKey: invoiceKeys.paginated(filter),
    queryFn: () => invoiceServices.getAll(filter),
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetBySupplier = (supplierId: number) => {
  return useQuery<GoodReceipt[], AxiosError>({
    queryKey: [...invoiceKeys.all, "by-supplier", supplierId],
    queryFn: () => goodReceiptServices.getBySupplier(supplierId),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newInvoice: InvoiceInput) =>
      invoiceServices.create(newInvoice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: InvoiceInput }) =>
      invoiceServices.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => invoiceServices.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
};
