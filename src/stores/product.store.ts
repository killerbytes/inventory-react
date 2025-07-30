import { CategorizedProductList } from "@/types";
import { create } from "zustand";

type ProductStore = {
  products: CategorizedProductList[];
  setProducts: (products: CategorizedProductList[]) => void;
};

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  setProducts: (products: CategorizedProductList[]) => set({ products }),
}));
