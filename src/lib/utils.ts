import {
  ApiErrorResponse,
  CategorizedProductList,
  GoodReceipt,
  Product,
  ProductCombinations,
  SalesOrder,
  StatusHistory,
} from "@/types";
import { ProductCommandSelectedItemProps } from "@/components/ProductCommand";
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
          name: comb.name,
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

// export const getMappedVariantValues = (variants, values) => {
//   const mappedVariantValues = {};
//   variants?.forEach((val) => {
//     mappedVariantValues[val.name] = values.find(
//       (v) => v.variantTypeId === val.id,
//     )?.value;
//   });
//   return mappedVariantValues;
// };

// export const getMappedProductComboName = (product, values) => {
//   const mapped = getMappedVariantValues(product?.variants, values);
//   return `${product?.name} - ${Object.keys(mapped)
//     .map((key) => `${key}: ${mapped[key]}`)
//     .join(" | ")}`;
// };

const getMappedVariantValues = (variants, values) => {
  const mappedVariantValues = {};
  variants.forEach((val) => {
    const found = values.find((v) => v.variantTypeId === val.id);
    if (found) {
      mappedVariantValues[val.name] = found.value;
    }
  });
  return mappedVariantValues;
};

export const getMappedProductComboName = (product, values) => {
  const mapped = getMappedVariantValues(product?.variants, values);

  const keys = Object.keys(mapped);
  const mergedParts: string[] = [];
  const remainingParts: string[] = [];
  const usedKeys = new Set();

  keys.forEach((key) => {
    if (usedKeys.has(key)) return;

    if (key.includes("_")) {
      const [base] = key.split("_");
      if (mapped[base]) {
        // merge pair first
        mergedParts.push(`${mapped[base]} x ${mapped[key]}`);
        usedKeys.add(base);
        usedKeys.add(key);
        return;
      }
    }
  });

  // collect remaining keys not used in merges
  keys
    .filter((key) => !usedKeys.has(key))
    .sort() // keep others sorted
    .forEach((key) => remainingParts.push(mapped[key]));

  const outputParts = [...mergedParts, ...remainingParts];

  return `${product?.name} - ${outputParts.join(" | ")}`;
};

export const getTotalAmountTableFooter = (data) => {
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

  const productCombinations = await productCombinationServices.search({
    limit: params.limit ?? 20,
    ...params,
  });

  const result = [];
  const words = search
    .toLowerCase()
    .split(" ")
    .filter((i) => i.length > 0);

  for (const item of productCombinations) {
    const productCombinations = item.combinations?.filter(
      (i: ProductCombinations) => {
        const name = i.name.toLowerCase();
        return words.every((word) => name.includes(word));
      },
    );

    result.push(...productCombinations);
  }
  return result;
};
