import { createProductCombinationSlice } from "./productCombinationSlice";
import { createGoodReceiptSlice } from "./goodReceiptSlice";
import { createSalesOrderSlice } from "./salesOrderSlice";
import { createSupplierSlice } from "./supplierSlice";
import { createCustomerSlice } from "./customerSlice";
import { createCategorySlice } from "./categorySlice";
import { createProductSlice } from "./productSlice";
import { immer } from "zustand/middleware/immer";
import { createAuthSlice } from "./authSlice";
import { StoreState } from "./store.types";
import { create } from "zustand";

export const useStore = create<StoreState>()(
  immer((...a) => ({
    ...createAuthSlice(...a),
    ...createSupplierSlice(...a),
    ...createCategorySlice(...a),
    ...createCustomerSlice(...a),
    ...createGoodReceiptSlice(...a),
    ...createProductCombinationSlice(...a),
    ...createProductSlice(...a),
    ...createSalesOrderSlice(...a),
  })),
);
