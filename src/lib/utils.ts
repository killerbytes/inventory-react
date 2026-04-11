import {
  ApiErrorResponse,
  GoodReceipt,
  ProductCombination,
  StatusHistory,
} from "@/schemas";
import { productCombinationServices } from "@/services";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function formatLabel(str: string) {
  return str
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getErrorMessage(error: ApiErrorResponse): ApiErrorResponse {
  const { errors, message, ...rest } = error;
  switch (error.code) {
    case "NOT_FOUND":
    case "VALIDATION_ERROR":
    default:
      return { errors, message, ...rest };
  }
}

export const mappedStatusHistory = (
  statusHistory: StatusHistory[],
): Record<string, StatusHistory> => {
  const map: Record<string, StatusHistory> = {};

  statusHistory.forEach((item) => {
    map[item.status] = item;
  });
  return map;
};

export const getTotalAmountTableFooter = <
  T extends {
    purchasePrice?: number;
    quantity?: number;
    discount?: number | null;
  },
>(
  data: T[],
) => {
  const total = data?.reduce(
    (acc, item) => {
      return {
        amount: acc.amount + (item.purchasePrice || 0) * (item.quantity || 0),
        purchasePrice: acc.purchasePrice + (Number(item.purchasePrice) || 0),
        discount: acc.discount + (Number(item.discount) || 0),
      };
    },
    {
      amount: 0,
      discount: 0,
      purchasePrice: 0,
    },
  );
  return total;
};

export const getGoodReceiptTotalAmount = (data: GoodReceipt[]) => {
  return data.reduce(
    (acc: number, item: GoodReceipt) =>
      acc + Number(item.totalAmount) - Number(item.totalReturnAmount),
    0,
  );
};

export const getMappedSearchProductCombinations = async (params: {
  search: string;
  limit?: number;
  noBreakPacks?: boolean;
}) => {
  const { search } = params;
  if (!search || search.length < 2) {
    return [];
  }

  const searchResults = await productCombinationServices.search({
    limit: params.limit ?? 20,
    ...params,
  });

  const result = [];
  const words = search
    .toLowerCase()
    .split(" ")
    .filter((i) => i.length > 0);

  for (const item of searchResults) {
    const isMatch = words.some((word) => item.description?.includes(word));

    const combinations = isMatch
      ? item.combinations.map((i: ProductCombination) => ({
          ...i,
          name: `${i.name} ***${item.description}***`,
          product: item,
        }))
      : item.combinations.map((i: ProductCombination) => ({
          ...i,
          product: { categoryId: item.categoryId },
        }));

    const filtered = (combinations ?? []).filter((i: ProductCombination) => {
      const name = i.name.toLowerCase();
      return words.every((word) => name.includes(word));
    });
    result.push(...filtered);
  }

  return result;
};

interface ProductCombinationWithSubItem extends ProductCombination {
  subItem?: ProductCombinationWithSubItem[];
}

export const groupSubItems = (
  items: ProductCombination[],
): ProductCombinationWithSubItem[] => {
  const itemRecord: Record<number, ProductCombinationWithSubItem> = {};
  items.forEach((item) => {
    itemRecord[item.id] = {
      ...item,
      subItem: undefined,
    };
  });
  const rootItems: ProductCombinationWithSubItem[] = [];
  Object.values(itemRecord).forEach((item) => {
    const parentId = item.isBreakPackOfId;
    if (parentId && itemRecord[parentId]) {
      itemRecord[parentId].subItem = [item];
    } else {
      rootItems.push(item);
    }
  });

  return rootItems;
};
