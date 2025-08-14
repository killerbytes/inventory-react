import { Variant } from "@/types";
import { create } from "zustand";

type VariantStore = {
  variants: Variant[];
  setVariants: (variants: Variant[]) => void;
};

export const useVariantStore = create<VariantStore>((set) => ({
  variants: [],
  setVariants: (variants: Variant[]) => set({ variants }),
}));
