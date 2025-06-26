import BaseService from "./base";
import type Http from "./http";
import type { Filter, Inventory } from ".";

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
}
