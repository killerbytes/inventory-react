import { GoodRecieptState } from "./goodReceiptSlice";
import { SalesOrderState } from "./salesOrderSlice";
import { AuthState } from "./authSlice";

export type StoreState = AuthState &
  // SupplierState &
  // CategoryState &
  // CustomerState &
  GoodRecieptState &
  // ProductCombinationState &
  // ProductState &
  SalesOrderState;
