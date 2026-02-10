import { CancelOrder, Return, SalesOrder } from "@/schemas";
import BaseService from "./base";
import type Http from "./http";

export default class SalesOrderService extends BaseService<SalesOrder> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/sales" });
  }
  cancelOrder = async (id: number, payload: CancelOrder) => {
    const response = await this.http.patch(`${this.url}/${id}/cancel`, payload);
    return response;
  };
  returnExchange = async (id: number, payload: Return) => {
    const response = await this.http.post(
      `${this.url}/${id}/return-exchange`,
      payload,
    );
    return response;
  };
}
