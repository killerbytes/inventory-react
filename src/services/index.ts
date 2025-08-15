import ProductCombinationService from "./productCombination";
import PurchaseOrderService from "./purchaseOrder";
import VariantTypesService from "./variantTypes";
import SalesOrderService from "./salesOrder";
import CategoryService from "./categories";
import InventoryService from "./inventory";
import SupplierService from "./suppliers";
import CustomerService from "./customers";
import ProductService from "./products";
import UserService from "./users";
import AuthService from "./auth";
import Http from "./http";

const http = new Http();

export const authServices = new AuthService({ http });
export const salesOrderServices = new SalesOrderService({ http });
export const purchaseOrderServices = new PurchaseOrderService({ http });
export const categoryServices = new CategoryService({ http });
export const userServices = new UserService({ http });
export const productServices = new ProductService({ http });
export const supplierServices = new SupplierService({ http });
export const customerServices = new CustomerService({ http });
export const inventoryServices = new InventoryService({ http });
export const variantTypesServices = new VariantTypesService({ http });
export const productCombinationServices = new ProductCombinationService({
  http,
});
