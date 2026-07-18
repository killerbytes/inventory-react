import {
  filterProps,
  InventoryMovement,
  PaginatedResponse,
  PriceHistory,
  StockAdjustment,
  Summary,
} from "@/schemas";
import {
  NoSales,
  Popular,
  Profit,
  Reorder,
} from "../../../schemas/reports.schema";
import { inventoryServices, reportServices } from "@/services";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

export const inventoryKeys = {
  priceHistory: ["inventory", "price-history"],
  movements: ["inventory", "movements"],
  stockAdjustments: ["inventory", "stock-adjustments"],
  reorderLevels: ["inventory", "reorder-levels"],
  popular: ["inventory", "popular"],
  profit: ["inventory", "profit"],
};

export const usePriceHistory = (filter: filterProps) => {
  return useQuery<PaginatedResponse<PriceHistory>, AxiosError>({
    queryKey: [...inventoryKeys.priceHistory, filter],
    queryFn: () => inventoryServices.getPriceHistory(filter),
    staleTime: 1000 * 60 * 5,
  });
};

export const useMovements = (filter: filterProps) => {
  return useQuery<
    PaginatedResponse<
      InventoryMovement,
      { totalValue: Summary; totalQuantity: Summary }
    >,
    AxiosError
  >({
    queryKey: [...inventoryKeys.movements, filter],
    queryFn: () => inventoryServices.getMovements(filter),
    staleTime: 1000 * 60 * 5,
  });
};

export const useStockAdjustments = (filter: filterProps) => {
  return useQuery<PaginatedResponse<StockAdjustment>, AxiosError>({
    queryKey: [...inventoryKeys.stockAdjustments, filter],
    queryFn: () => inventoryServices.getStockAdjustments(filter),
    staleTime: 1000 * 60 * 5,
  });
};

export const useReorderLevels = (filter: filterProps) => {
  return useQuery<PaginatedResponse<Reorder>, AxiosError>({
    queryKey: [...inventoryKeys.reorderLevels, filter],
    queryFn: () => inventoryServices.getReorderLevels(filter),
    staleTime: 1000 * 60 * 5,
  });
};

export const usePopularProducts = (filter: filterProps) => {
  return useQuery<PaginatedResponse<Popular>, AxiosError>({
    queryKey: ["inventory", "popular", filter],
    queryFn: () => reportServices.popular(filter),
    staleTime: 1000 * 60 * 5,
  });
};

export const useProfit = (filter: filterProps) => {
  return useQuery<PaginatedResponse<Profit>, AxiosError>({
    queryKey: ["inventory", "profit", filter],
    queryFn: () => reportServices.profit(filter),
    staleTime: 1000 * 60 * 5,
  });
};

export const useNoSales = (filter: filterProps) => {
  return useQuery<PaginatedResponse<NoSales>, AxiosError>({
    queryKey: ["inventory", "no-sales", filter],
    queryFn: () => reportServices.noSales(filter),
    staleTime: 1000 * 60 * 5,
  });
};
