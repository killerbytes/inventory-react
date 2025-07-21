import type { PurchaseOrder } from ".";
import BaseService from "./base";
import type Http from "./http";

export default class PurchaseOrderService extends BaseService<PurchaseOrder> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/purchase" });
  }
  cancelOrder = async (id: string, data: PurchaseOrder) => {
    const response = await this.http.patch(`${this.url}/${id}/cancel`, data);
    return response;
  };
}
