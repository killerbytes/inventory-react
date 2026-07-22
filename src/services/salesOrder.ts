import { CancelOrder, ReturnForm, SalesOrder, SalesOrderForm } from "@/schemas";
import BaseService from "./base";
import type Http from "./http";

export default class SalesOrderService extends BaseService<
  SalesOrder | SalesOrderForm
> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/sales" });
  }
  cancel = async (id: number, payload: CancelOrder) => {
    const response = await this.http.patch(`${this.url}/${id}/cancel`, payload);
    return response;
  };
  returnExchange = async (id: number, payload: ReturnForm) => {
    const response = await this.http.post(
      `${this.url}/${id}/return-exchange`,
      payload,
    );
    return response;
  };

  ocr = async (payload: FormData) => {
    const response = await this.http.upload(`/ocr/parse-receipt`, payload);

    return response;
  };

  dailySales = async () => {
    const response = await this.http.get(`${this.url}/daily-sales`);
    return response;
  };
}
