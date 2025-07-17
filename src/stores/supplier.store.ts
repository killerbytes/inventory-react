import { Supplier } from "@/services";
import { create } from "zustand";

type SupplierStore = {
  suppliers: Supplier[];
  setSuppliers: (suppliers: Supplier[]) => void;
};

export const useSupplierStore = create<SupplierStore>((set) => ({
  suppliers: [],
  setSuppliers: (suppliers: Supplier[]) => set({ suppliers }),
}));
