import { create } from "zustand";

interface GoodRecieptStore {
  returnEnabled: boolean;
  setReturnEnabled: (returnEnabled: boolean) => void;
}

export const useGoodReceiptStore = create<GoodRecieptStore>((set) => ({
  returnEnabled: false,
  setReturnEnabled: (returnEnabled: boolean) => set({ returnEnabled }),
}));
