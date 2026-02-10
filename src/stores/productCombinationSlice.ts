import { ProductCombinations } from "@/schemas";
import { StoreState } from "./store.types";
import { StateCreator } from "zustand";

export type ProductCombinationState = {
  productCombinationState: {
    hasLoaded: boolean;
    noBreakPackHasLoaded: boolean;
    invalidate: () => void;
    productCombinations: ProductCombinations[];
    noBreakPack: ProductCombinations[];
    setProductsCombinations: (
      productsCombinations: ProductCombinations[],
    ) => void;
    setNoBreakPack: (NoBreakPack: ProductCombinations[]) => void;
  };
};

export const createProductCombinationSlice: StateCreator<
  StoreState,
  [["zustand/immer", never]],
  [],
  ProductCombinationState
> = (set) => ({
  productCombinationState: {
    productCombinations: [],
    hasLoaded: false,
    noBreakPack: [],
    noBreakPackHasLoaded: false,
    setProductsCombinations: (productCombinations: ProductCombinations[]) => {
      set(({ productCombinationState }) => {
        productCombinationState.productCombinations = productCombinations;
        productCombinationState.hasLoaded = true;
      });
    },
    setNoBreakPack: (NoBreakPack: ProductCombinations[]) =>
      set(({ productCombinationState }) => {
        productCombinationState.noBreakPack = NoBreakPack;
        productCombinationState.noBreakPackHasLoaded = true;
      }),
    invalidate: () =>
      set(({ productCombinationState }) => {
        productCombinationState.hasLoaded = false;
        productCombinationState.noBreakPackHasLoaded = false;
      }),
  },
});
