import { ProductCombinations } from "@/types";
import { create } from "zustand";

type ProductCombinationStore = {
  productCombinationsHasLoaded: boolean;
  productCombinationsNoBreakPackHasLoaded: boolean;
  invalidate: () => void;
  productCombinations: ProductCombinations[];
  productCombinationsNoBreakPack: ProductCombinations[];
  setProductsCombinations: (
    productsCombinations: ProductCombinations[],
  ) => void;
  setProductCombinationsNoBreakPack: (
    productCombinationsNoBreakPack: ProductCombinations[],
  ) => void;
};

export const useProductCombinationStore = create<ProductCombinationStore>(
  (set) => ({
    productCombinations: [],
    productCombinationsHasLoaded: false,
    productCombinationsNoBreakPack: [],
    productCombinationsNoBreakPackHasLoaded: false,
    setProductsCombinations: (productCombinations: ProductCombinations[]) =>
      set({ productCombinations, productCombinationsHasLoaded: true }),
    setProductCombinationsNoBreakPack: (
      productCombinationsNoBreakPack: ProductCombinations[],
    ) =>
      set({
        productCombinationsNoBreakPack,
        productCombinationsNoBreakPackHasLoaded: true,
      }),
    invalidate: () =>
      set({
        productCombinationsHasLoaded: false,
        productCombinationsNoBreakPackHasLoaded: false,
      }),
  }),
);
