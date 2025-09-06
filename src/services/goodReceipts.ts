import { CancelOrder, GoodReceipt } from "@/types";
import BaseService from "./base";
import type Http from "./http";

export default class GoodReceiptService extends BaseService<GoodReceipt> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/goodReceipt" });
  }
  cancelOrder = async (id: number, payload: CancelOrder) => {
    const response = await this.http.patch(`${this.url}/${id}/cancel`, payload);
    return response;
  };
  getBySupplier = async (id: number) => {
    const response = await this.http.get(`${this.url}/supplier/${id}`);
    return response;
  };
}
