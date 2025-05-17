import BaseService from "./base";
import type Http from "./http";
import type { SalesOrder } from "@/pages/SalesOrders";

export default class SalesOrderService extends BaseService<SalesOrder> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/sales" });
  }
  updateStatus = async (id, data) => {
    const response = await this.http.patch(`${this.url}/${id}/status`, data);
    return response;
  };
}
