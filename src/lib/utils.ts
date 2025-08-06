import {
  ApiErrorResponse,
  CategorizedProductList,
  ProductCombinations,
} from "@/types";
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

export function getErrorMessage(error: ApiErrorResponse) {
  const { errors, message, ...rest } = error;
  switch (error.code) {
    case "ERR_NETWORK":
      return "Network error occurred";
    case "NOT_FOUND":
    case "INTERNAL_ERROR":
      return { message, ...rest };
    case "VALIDATION_ERROR":
      return { errors, message, ...rest };
    default:
      return "Unknown error occurred";
  }
}

export function getSKU(combination: ProductCombinations) {
  console.log(combination);

  // return `${combination.product.name}-${combination.product.id}`;
}

export function flattenedProduct(data: CategorizedProductList[]) {
  const flattened: {
    combinationId?: number;
    productName: string;
    unit: string;
    variants: { variantType: string | undefined; value: string }[];
  }[] = [];

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
