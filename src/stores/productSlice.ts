import { CategorizedProductList } from "@/schemas";
import { StoreState } from "./store.types";
import { StateCreator } from "zustand";

export type ProductState = {
  productState: {
    hasLoaded: boolean;
    invalidate: () => void;
    products: CategorizedProductList[];
    setProducts: (products: CategorizedProductList[]) => void;
  };
};

export const createProductSlice: StateCreator<
  StoreState,
  [["zustand/immer", never]],
  [],
  ProductState
> = (set) => ({
  productState: {
    hasLoaded: false,
    invalidate: () =>
      set(({ productState }) => {
        productState.hasLoaded = false;
      }),
    products: [],
    setProducts: (products: CategorizedProductList[]) =>
      set(({ productState }) => {
        productState.products = products;
        productState.hasLoaded = true;
      }),
  },
});
