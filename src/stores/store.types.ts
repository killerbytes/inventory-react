import { ProductCombinationState } from "./productCombinationSlice";
import { GoodRecieptState } from "./goodReceiptSlice";
import { SalesOrderState } from "./salesOrderSlice";
import { SupplierState } from "./supplierSlice";
import { CustomerState } from "./customerSlice";
import { CategoryState } from "./categorySlice";
import { ProductState } from "./productSlice";
import { AuthState } from "./authSlice";

export type StoreState = AuthState &
  SupplierState &
  CategoryState &
  CustomerState &
  GoodRecieptState &
  ProductCombinationState &
  ProductState &
  SalesOrderState;
