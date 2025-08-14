import { CancelOrder, PurchaseOrder } from "@/types";
import BaseService from "./base";
import type Http from "./http";

export default class PurchaseOrderService extends BaseService<PurchaseOrder> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/purchase" });
  }
  cancelOrder = async (id: number, payload: CancelOrder) => {
    const response = await this.http.patch(`${this.url}/${id}/cancel`, payload);
    return response;
  };
}
