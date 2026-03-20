import { createGoodReceiptSlice } from "./goodReceiptSlice";
import { createSalesOrderSlice } from "./salesOrderSlice";
import { immer } from "zustand/middleware/immer";
import { createAuthSlice } from "./authSlice";
import { StoreState } from "./store.types";
import { create } from "zustand";

export const useStore = create<StoreState>()(
  immer((...a) => ({
    ...createAuthSlice(...a),
    // ...createSupplierSlice(...a),
    // ...createCategorySlice(...a),
    // ...createCustomerSlice(...a),
    ...createGoodReceiptSlice(...a),
    // ...createProductCombinationSlice(...a),
    // ...createProductSlice(...a),
    ...createSalesOrderSlice(...a),
  })),
);
