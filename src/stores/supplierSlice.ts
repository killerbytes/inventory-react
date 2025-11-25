import { StateCreator } from "zustand";
import { Supplier } from "@/types";

export type SupplierState = {
  supplierState: {
    hasLoaded: boolean;
    invalidate: () => void;
    suppliers: Supplier[];
    setSuppliers: (suppliers: Supplier[]) => void;
  };
};

export const createSupplierSlice: StateCreator<
  SupplierState,
  [["zustand/immer", never]],
  [],
  SupplierState
> = (set) => ({
  supplierState: {
    hasLoaded: false,
    invalidate: () =>
      set((state) => {
        state.supplierState.hasLoaded = false;
      }),
    suppliers: [],
    setSuppliers: (suppliers: Supplier[]) =>
      set((state) => {
        state.supplierState.suppliers = suppliers;
        state.supplierState.hasLoaded = true;
      }),
  },
});
