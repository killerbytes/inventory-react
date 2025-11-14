import { create } from "zustand";

interface SalesOrderStore {
  returnEnabled: boolean;
  setReturnEnabled: (returnEnabled: boolean) => void;
}

export const useSalesOrderStore = create<SalesOrderStore>((set) => ({
  returnEnabled: false,
  setReturnEnabled: (returnEnabled: boolean) => set({ returnEnabled }),
}));
