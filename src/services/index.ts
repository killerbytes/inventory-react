import AuthService from "./auth";
import CategoryService from "./categories";
import Http from "./http";
import ProductService from "./products";
import UserService from "./users";
import SupplierService from "./suppliers";
import PurchaseOrderService from "./purchaseOrder";

const http = new Http();

export default {
  authServices: new AuthService({ http }),
  categoryServices: new CategoryService({ http }),
  userServices: new UserService({ http }),
  productServices: new ProductService({ http }),
  supplierServices: new SupplierService({ http }),
  purchaseOrderServices: new PurchaseOrderService({ http }),
};

export type APIResponse<T> = {
  data: T;
  total: number;
  totalPages: number;
  currentPage: number;
};

export interface ApiError {
  field?: string;
  message: string;
}
