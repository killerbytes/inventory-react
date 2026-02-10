import { StoreState } from "./store.types";
import { StateCreator } from "zustand";
import { Customer } from "@/schemas";

export type CustomerState = {
  customerState: {
    customers: Customer[];
    setCustomers: (customers: Customer[]) => void;
    hasLoaded: boolean;
    invalidate: () => void;
  };
};

export const createCustomerSlice: StateCreator<
  StoreState,
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
        customerState.hasLoaded = true;
      }),
  },
});
