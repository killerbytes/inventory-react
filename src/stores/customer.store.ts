import { Customer } from "@/types";
import { create } from "zustand";

type CustomerStore = {
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
  hasLoaded: boolean;
  invalidate: () => void;
};

export const useCustomerStore = create<CustomerStore>((set) => ({
  customers: [],
  hasLoaded: false,
  invalidate: () => set({ hasLoaded: false }),
  setCustomers: (customers: Customer[]) => set({ customers, hasLoaded: true }),
}));
