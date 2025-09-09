import {
  BreakPack,
  Inventory,
  InventoryMovement,
  StockAdjustment,
} from "@/types";
import BaseService from "./base";
import type Http from "./http";

export default class InventoryService extends BaseService<Inventory> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/inventory" });
  }

  getMovements = async (data?: InventoryMovement) => {
    return await this.http.post(`${this.url}/movements`, data);
  };

  getBreakPacks = async (data: any) => {
    return await this.http.post(`${this.url}/breakPacks`, data);
  };

  getStockAdjustments = async (data?: StockAdjustment) => {
    return await this.http.post(`${this.url}/stockAdjustments`, data);
  };
}
