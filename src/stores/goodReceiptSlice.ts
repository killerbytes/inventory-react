import { StateCreator } from "zustand";

export interface GoodRecieptState {
  goodReceiptState: {
    returnEnabled: boolean;
    setReturnEnabled: (returnEnabled: boolean) => void;
  };
}

export const createGoodReceiptSlice: StateCreator<
  GoodRecieptState,
  [["zustand/immer", never]],
  [],
  GoodRecieptState
> = (set) => ({
  goodReceiptState: {
    returnEnabled: false,
    setReturnEnabled: (returnEnabled: boolean) =>
      set(({ goodReceiptState }) => {
        goodReceiptState.returnEnabled = returnEnabled;
      }),
  },
});
