import {
  filterProps,
  PaginatedResponse,
  PaymentApplication,
  PaymentInput,
} from "@/schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { invoiceKeys } from "@/features/invoices/hooks/useInvoices";
import { paymentServices } from "@/services";
import { AxiosError } from "axios";

export const paymentKeys = {
  all: ["payments"],
  paginated: (filter: filterProps) => [...paymentKeys.all, "paginated", filter],
};

export const usePaymentsPaginated = (filter: filterProps) => {
  return useQuery<PaginatedResponse<PaymentApplication>, AxiosError>({
    queryKey: paymentKeys.paginated(filter),
    queryFn: () => paymentServices.getAll(filter),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newPayment: PaymentInput) =>
      paymentServices.create(newPayment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
};
