import BaseService from "./base";
import type Http from "./http";
import type { Product } from "./products";

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
  status?: string | null | undefined;
  deliveryDate: string;
  receivedDate?: string | null | undefined;
  totalAmount?: number | null | undefined;
  orderBy?: number | null | undefined;
  receivedBy?: number | null | undefined;
  notes?: string | null | undefined;
  purchaseOrderItems: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id?: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  discount?: number | null | undefined;
  product?: Product;
}
