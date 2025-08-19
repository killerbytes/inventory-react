import { VariantTypes } from "@/types";
import { create } from "zustand";

type VariantStore = {
  variants: VariantTypes[];
  setVariants: (variants: VariantTypes[]) => void;
};

export const useVariantStore = create<VariantStore>((set) => ({
  variants: [],
  setVariants: (variants: VariantTypes[]) => set({ variants }),
}));
