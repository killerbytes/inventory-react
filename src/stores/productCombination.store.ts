import { ProductCombinations } from "@/types";
import { create } from "zustand";

type ProductCombinationStore = {
  productCombinations: ProductCombinations[];
  setProductsCombinations: (
    productsCombinations: ProductCombinations[],
  ) => void;
};

export const useProductCombinationStore = create<ProductCombinationStore>(
  (set) => ({
    productCombinations: [],
    setProductsCombinations: (productCombinations: ProductCombinations[]) =>
      set({ productCombinations }),
  }),
);
