import BaseService from "./base";
import type Http from "./http";
import type { Filter } from ".";
import type { Product } from "./products";

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

export interface Inventory {
  id: number;
  name: string;
  quantity: number;
  updatedAt: Date;
  product: Product;
}
