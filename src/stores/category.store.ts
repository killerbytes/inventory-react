import { Category } from "@/types";
import { create } from "zustand";

type CategoryStore = {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
};

export const useCategoryStore = create<CategoryStore>((set) => ({
  categories: [],
  setCategories: (categories: Category[]) => set({ categories }),
}));
