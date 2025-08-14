import { Customer } from "@/types";
import { create } from "zustand";

type CustomerStore = {
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
};

export const useCustomerStore = create<CustomerStore>((set) => ({
  customers: [],
  setCustomers: (customers: Customer[]) => set({ customers }),
}));
