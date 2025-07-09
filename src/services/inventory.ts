import type { Filter, Inventory } from ".";
import BaseService from "./base";
import type Http from "./http";

export default class InventoryService extends BaseService<Inventory> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/inventory" });
  }
  transactions = async (params: Filter) => {
    const response = await this.http.get(`${this.url}/transactions`, {
      params,
    });
    return response;
  };
  updatePrice = async (id: string, data: any) => {
    const response = await this.http.patch(`${this.url}/${id}/price`, data);
    return response;
  };
}
