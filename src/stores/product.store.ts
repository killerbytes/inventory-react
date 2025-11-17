import { ProductCommandSelectedItemProps } from "@/components/ProductCommand";
import { CategorizedProductList } from "@/types";
import { flattenedProduct } from "@/lib/utils";
import { create } from "zustand";

type ProductStore = {
  hasLoaded: boolean;
  invalidate: () => void;
  products: CategorizedProductList[];
  flatProducts: ProductCommandSelectedItemProps[];
  setProducts: (products: CategorizedProductList[]) => void;
};

export const useProductStore = create<ProductStore>((set) => ({
  hasLoaded: false,
  invalidate: () => set({ hasLoaded: false }),
  products: [],
  flatProducts: [],
  setProducts: (products: CategorizedProductList[]) =>
    set({
      products,
      flatProducts: flattenedProduct(products),
      hasLoaded: true,
    }),
}));
