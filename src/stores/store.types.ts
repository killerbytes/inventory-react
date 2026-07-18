import { GoodRecieptState } from "./goodReceiptSlice";
import { SalesOrderState } from "./salesOrderSlice";
import { AuthState } from "./authSlice";

export type StoreState = AuthState &
  GoodRecieptState &
  SalesOrderState;
