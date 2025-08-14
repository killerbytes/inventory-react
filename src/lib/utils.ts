import {
  ApiErrorResponse,
  CategorizedProductList,
  ProductCombinations,
  StatusHistory,
} from "@/types";
import {
  ProductCommandSelectedItemProps,
  SelectedItemProps,
} from "@/components/ProductCommand";
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

export function getSKU(combination: ProductCombinations) {
  console.log(combination);

  // return `${combination.product.name}-${combination.product.id}`;
}

export function flattenedProduct(data: CategorizedProductList[]) {
  const flattened: ProductCommandSelectedItemProps[] = [];

  data.forEach((cat) =>
    cat.products.forEach((prod) => {
      const variantMap = Object.fromEntries(
        prod.variants.map((v) => [v.id, v.name]),
      );

      prod.combinations.forEach((comb) => {
        flattened.push({
          combinationId: comb.id,
          productName: prod.name,
          unit: prod.unit,
          price: comb.price,
          variants: comb.values.map((v) => ({
            variantType:
              v.variantTypeId != null ? variantMap[v.variantTypeId] : undefined,
            value: v.value,
          })),
        });
      });
    }),
  );
  return flattened;
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

export const getMappedVariantValues = (variants, values) => {
  const mappedVariantValues = {};
  variants.forEach((val) => {
    mappedVariantValues[val.name] = values.find(
      (v) => v.variantTypeId === val.id,
    ).value;
  });
  return mappedVariantValues;
};
