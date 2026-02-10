import { StoreState } from "./store.types";
import { StateCreator } from "zustand";
import { Category } from "@/schemas";

export type CategoryState = {
  categoryState: {
    categories: Category[];
    hasLoaded: boolean;
    invalidate: () => void;
    setCategories: (categories: Category[]) => void;
  };
};

export const createCategorySlice: StateCreator<
  StoreState,
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
