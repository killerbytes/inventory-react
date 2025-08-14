import { ProductCommandSelectedItemProps } from "@/components/ProductCommand";
import { CategorizedProductList } from "@/types";
import { flattenedProduct } from "@/lib/utils";
import { create } from "zustand";

type ProductStore = {
  products: CategorizedProductList[];
  flatProducts: ProductCommandSelectedItemProps[];
  setProducts: (products: CategorizedProductList[]) => void;
};

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  flatProducts: [],
  setProducts: (products: CategorizedProductList[]) =>
    set({ products, flatProducts: flattenedProduct(products) }),
}));
