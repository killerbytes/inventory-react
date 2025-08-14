import { create } from "zustand";

type GlobalStore = {
  variantTemplateModal: boolean;
  setVariantTemplateModal: (value: boolean) => void;
};

export const useGlobalStore = create<GlobalStore>((set) => ({
  variantTemplateModal: false,
  setVariantTemplateModal: (variantTemplateModal) =>
    set({ variantTemplateModal }),
}));
