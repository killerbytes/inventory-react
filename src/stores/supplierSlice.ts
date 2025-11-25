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
      set(({ supplierState }) => {
        supplierState.hasLoaded = false;
      }),
    suppliers: [],
    setSuppliers: (suppliers: Supplier[]) =>
      set(({ supplierState }) => {
        supplierState.suppliers = suppliers;
        supplierState.hasLoaded = true;
      }),
  },
});
