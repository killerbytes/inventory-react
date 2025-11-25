import { StateCreator } from "zustand";

export interface SalesOrderState {
  salesOrderState: {
    returnEnabled: boolean;
    setReturnEnabled: (returnEnabled: boolean) => void;
  };
}

export const createSalesOrderSlice: StateCreator<
  SalesOrderState,
  [["zustand/immer", never]],
  [],
  SalesOrderState
> = (set) => ({
  salesOrderState: {
    returnEnabled: false,
    setReturnEnabled: (returnEnabled: boolean) =>
      set(({ salesOrderState }) => {
        salesOrderState.returnEnabled = returnEnabled;
      }),
  },
});
