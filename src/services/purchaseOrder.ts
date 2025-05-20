import BaseService from "./base";
import type Http from "./http";
import type { Product } from "./products";
import type { Supplier } from "./suppliers";
import type { User } from "./users";

export default class PurchaseOrderService extends BaseService<PurchaseOrder> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/purchase" });
  }
  updateStatus = async (id, data) => {
    const response = await this.http.patch(`${this.url}/${id}/status`, data);
    return response;
  };
}

export interface PurchaseOrder {
  id?: number;
  supplierId: number;
  orderDate: string;
  status: string;
  deliveryDate: string;
  receivedDate: string;
  totalAmount: number;
  orderBy: number;
  receivedBy: number;
  notes: string;
  supplier: Supplier;
  orderByUser: User;
  purchaseOrderItems: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id?: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  discount: number;
  product: Product;
}
