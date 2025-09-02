import { ProductCombinations } from "@/types";
import { create } from "zustand";

type ProductCombinationStore = {
  loaded: boolean;
  invalidate: () => void;
  productCombinations: ProductCombinations[];
  setProductsCombinations: (
    productsCombinations: ProductCombinations[],
  ) => void;
};

export const useProductCombinationStore = create<ProductCombinationStore>(
  (set) => ({
    productCombinations: [],
    loaded: false,
    setProductsCombinations: (productCombinations: ProductCombinations[]) =>
      set({ productCombinations, loaded: true }),
    invalidate: () => set({ loaded: false }),
  }),
);
