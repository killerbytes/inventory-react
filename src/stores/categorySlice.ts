import { StateCreator } from "zustand";
import { Category } from "@/types";

export type CategoryState = {
  categoryState: {
    categories: Category[];
    hasLoaded: boolean;
    invalidate: () => void;
    setCategories: (categories: Category[]) => void;
  };
};

export const createCategorySlice: StateCreator<
  CategoryState,
  [["zustand/immer", never]],
  [],
  CategoryState
> = (set) => ({
  categoryState: {
    categories: [],
    hasLoaded: false,
    setCategories: (categories: Category[]) =>
      set(({ categoryState }) => {
        categoryState.categories = categories;
        categoryState.hasLoaded = true;
      }),
    invalidate: () =>
      set(({ categoryState }) => {
        categoryState.hasLoaded = false;
      }),
  },
});
