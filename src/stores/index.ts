import {
  createProductCombinationSlice,
  ProductCombinationState,
} from "./productCombinationSlice";
import { createGoodReceiptSlice, GoodRecieptState } from "./goodReceiptSlice";
import { createSalesOrderSlice, SalesOrderState } from "./salesOrderSlice";
import { createSupplierSlice, SupplierState } from "./supplierSlice";
import { createCustomerSlice, CustomerState } from "./customerSlice";
import { CategoryState, createCategorySlice } from "./categorySlice";
import { createProductSlice, ProductState } from "./productSlice";
import { AuthState, createAuthSlice } from "./authSlice";
import { immer } from "zustand/middleware/immer";
import { create } from "zustand";

export const useStore = create<
  AuthState &
    SupplierState &
    CategoryState &
    CustomerState &
    GoodRecieptState &
    ProductCombinationState &
    ProductState &
    SalesOrderState
>()(
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
