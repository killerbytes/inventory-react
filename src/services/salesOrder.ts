import type { SalesOrder } from ".";
import BaseService from "./base";
import type Http from "./http";

export default class SalesOrderService extends BaseService<SalesOrder> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/sales" });
  }
  updateStatus = async (id: number, data: SalesOrder) => {
    const response = await this.http.patch(`${this.url}/${id}/status`, data);
    return response;
  };
}
