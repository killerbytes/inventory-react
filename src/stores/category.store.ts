import { Category } from "@/types";
import { create } from "zustand";

type CategoryStore = {
  categories: Category[];
  list: Category[];
  setCategories: (categories: Category[]) => void;
};

export const useCategoryStore = create<CategoryStore>((set) => ({
  categories: [],
  list: [],
  setCategories: (categories: Category[]) => set({ categories }),
}));
