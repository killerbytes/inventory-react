import BaseService from "./base";
import type Http from "./http";
import type { Product } from "./products";
import type { Supplier } from "./suppliers";
import type { User } from "./users";

export default class SalesOrderService extends BaseService<SalesOrder> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/sales" });
  }
  updateStatus = async (id, data) => {
    const response = await this.http.patch(`${this.url}/${id}/status`, data);
    return response;
  };
}

export interface SalesOrder {
  id?: number;
  customer: string;
  orderDate: string;
  status: string;
  deliveryDate: string;
  receivedDate: string;
  totalAmount: number;
  orderBy: number;
  receivedBy: number;
  notes: string;
  supplier: Supplier;
  receivedByUser: User;
  salesOrderItems: SalesOrderItem[];
}

export interface SalesOrderItem {
  id?: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  discount: number;
  product: Product;
}
