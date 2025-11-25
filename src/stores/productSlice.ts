import { ProductCommandSelectedItemProps } from "@/components/ProductCommand";
import { CategorizedProductList } from "@/types";
import { flattenedProduct } from "@/lib/utils";
import { StateCreator } from "zustand";

export type ProductState = {
  productState: {
    hasLoaded: boolean;
    invalidate: () => void;
    products: CategorizedProductList[];
    flatProducts: ProductCommandSelectedItemProps[];
    setProducts: (products: CategorizedProductList[]) => void;
  };
};

export const createProductSlice: StateCreator<
  ProductState,
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
    flatProducts: [],
    setProducts: (products: CategorizedProductList[]) =>
      set(({ productState }) => {
        productState.products = products;
        productState.flatProducts = flattenedProduct(products);
        productState.hasLoaded = true;
      }),
  },
});
