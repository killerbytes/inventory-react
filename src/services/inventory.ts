import { filterProps, Inventory, ReturnTransaction } from "@/schemas";
import BaseService from "./base";
import type Http from "./http";

export default class InventoryService extends BaseService<Inventory> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/inventory" });
  }

  getMovements = async (data: filterProps) => {
    return await this.http.post(`${this.url}/movements`, data);
  };

  getBreakPacks = async (data: filterProps) => {
    return await this.http.post(`${this.url}/break-packs`, data);
  };

  getStockAdjustments = async (data: filterProps) => {
    return await this.http.post(`${this.url}/stock-adjustments`, data);
  };

  getPriceHistory = async (data: filterProps) => {
    return await this.http.post(`${this.url}/price-history`, data);
  };
  getReorderLevels = async (data: filterProps) => {
    return await this.http.get(`${this.url}/reorder-levels`, { params: data });
  };
  getReturnTransaction = async (id: number): Promise<ReturnTransaction[]> => {
    return await this.http.get(`${this.url}/${id}/return-transaction`);
  };

  getReturnItems = async (id: number) => {
    return await this.http.get(`${this.url}/${id}/return-items`);
  };
}
