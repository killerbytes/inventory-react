import { ProductCombinations } from "@/types";
import { create } from "zustand";

type ProductCombinationStore = {
  hasLoaded: boolean;
  invalidate: () => void;
  productCombinations: ProductCombinations[];
  setProductsCombinations: (
    productsCombinations: ProductCombinations[],
  ) => void;
};

export const useProductCombinationStore = create<ProductCombinationStore>(
  (set) => ({
    productCombinations: [],
    hasLoaded: false,
    setProductsCombinations: (productCombinations: ProductCombinations[]) =>
      set({ productCombinations, hasLoaded: true }),
    invalidate: () => set({ hasLoaded: false }),
  }),
);
