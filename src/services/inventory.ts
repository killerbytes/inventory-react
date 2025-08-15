import { Inventory, InventoryMovement } from "@/types";
import BaseService from "./base";
import type Http from "./http";

export default class InventoryService extends BaseService<Inventory> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/inventory" });
  }

  movements = async (data?: InventoryMovement) => {
    const response = await this.http.post(`${this.url}/movements`, data);
    return response;
  };
}
