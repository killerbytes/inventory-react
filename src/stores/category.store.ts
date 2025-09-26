import { Category } from "@/types";
import { create } from "zustand";

type CategoryStore = {
  categories: Category[];
  hasLoaded: boolean;
  invalidate: () => void;
  setCategories: (categories: Category[]) => void;
};

export const useCategoryStore = create<CategoryStore>((set) => ({
  categories: [],
  hasLoaded: false,
  setCategories: (categories: Category[]) =>
    set({ categories, hasLoaded: true }),
  invalidate: () => set({ hasLoaded: false }),
}));
