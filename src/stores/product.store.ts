import { Product } from "@/services";
import { create } from "zustand";

type ProductStore = {
  products: Product[];
  setProducts: (products: Product[]) => void;
};

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  setProducts: (products: Product[]) => set({ products }),
}));
