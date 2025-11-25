import { StateCreator } from "zustand";
import { Customer } from "@/types";

export type CustomerState = {
  customerState: {
    customers: Customer[];
    setCustomers: (customers: Customer[]) => void;
    hasLoaded: boolean;
    invalidate: () => void;
  };
};

export const createCustomerSlice: StateCreator<
  CustomerState,
  [["zustand/immer", never]],
  [],
  CustomerState
> = (set) => ({
  customerState: {
    customers: [],
    hasLoaded: false,
    invalidate: () =>
      set(({ customerState }) => {
        customerState.hasLoaded = false;
      }),
    setCustomers: (customers: Customer[]) =>
      set(({ customerState }) => {
        customerState.customers = customers;
      }),
  },
});
