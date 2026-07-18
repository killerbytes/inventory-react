import { ProductWithCombinations } from "./product.schema";
import { Inventory } from "./inventory.schema";
import z from "zod";

export const statusHistorySchema = z.object({
  id: z.number().optional(),
  status: z.string(),
  changedBy: z.number(),
  changedAt: z.string(),
  user: z.any(),
});

export const cancelOrderSchema = z.object({
  reason: z.string().min(2, {
    message: "Reason must be at least 2 characters.",
  }),
});

type ValidationError = {
  field: string;
  message: string;
};

export interface ApiErrorResponse {
  code: string;
  details: string;
  errors: ValidationError[];
  message: string;
  statusCode: number;
}

export interface Summary {
  label: string;
  value: number;
}

export type Meta = {
  total: number;
  totalPages: number;
  currentPage: number;
};

export type PaginatedResponse<T extends object, S = object> = {
  data: T[];
  meta: Meta;
  summary?: S;
};

export interface ApiError {
  field?: string;
  message: string;
}

export interface filterProps {
  limit?: number;
  page?: number;
  q?: string;
  type?: string;
  sort?: string;
  status?: string;
  order?: "ASC" | "DESC";
}

export interface pagerProps<T> {
  meta: Meta;
  filter: T;
  setFilter: React.Dispatch<React.SetStateAction<T>>;
}

export interface CategorizedItemList<T> {
  categoryId: string;
  categoryName: string;
  items: T[];
}

export interface CategorizedProductList {
  categoryId: number;
  categoryName: string;
  categoryOrder: number;
  products: ProductWithCombinations[];
}

export interface CategorizedInventoryList {
  categoryId: number;
  categoryName: string;
  inventories: Inventory[];
}

export type CancelOrder = z.infer<typeof cancelOrderSchema>;

export type StatusHistory = z.infer<typeof statusHistorySchema>;
