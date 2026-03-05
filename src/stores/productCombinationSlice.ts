import { ProductCombination } from "@/schemas";
import { StoreState } from "./store.types";
import { StateCreator } from "zustand";

export type ProductCombinationState = {
  productCombinationState: {
    hasLoaded: boolean;
    noBreakPackHasLoaded: boolean;
    invalidate: () => void;
    ProductCombination: ProductCombination[];
    noBreakPack: ProductCombination[];
    setProductsCombinations: (
      productsCombinations: ProductCombination[],
    ) => void;
    setNoBreakPack: (NoBreakPack: ProductCombination[]) => void;
  };
};

export const createProductCombinationSlice: StateCreator<
  StoreState,
  [["zustand/immer", never]],
  [],
  ProductCombinationState
> = (set) => ({
  productCombinationState: {
    ProductCombination: [],
    hasLoaded: false,
    noBreakPack: [],
    noBreakPackHasLoaded: false,
    setProductsCombinations: (ProductCombination: ProductCombination[]) => {
      set(({ productCombinationState }) => {
        productCombinationState.ProductCombination = ProductCombination;
        productCombinationState.hasLoaded = true;
      });
    },
    setNoBreakPack: (NoBreakPack: ProductCombination[]) =>
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
