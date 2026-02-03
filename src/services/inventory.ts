import { filterProps, Inventory, ReturnTransaction } from "@/types";
import BaseService from "./base";
import type Http from "./http";

export default class InventoryService extends BaseService<Inventory> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/inventory" });
  }

  getMovements = async (data?: filterProps) => {
    return await this.http.post(`${this.url}/movements`, data);
  };

  getBreakPacks = async (data: any) => {
    return await this.http.post(`${this.url}/break-packs`, data);
  };

  getStockAdjustments = async (data?: filterProps) => {
    return await this.http.post(`${this.url}/stockAdjustments`, data);
  };

  getPriceHistory = async (data?: any) => {
    return await this.http.post(`${this.url}/priceHistory`, data);
  };
  getReorderLevels = async (data?: any) => {
    return await this.http.get(`${this.url}/reorderLevels`, { params: data });
  };
  getReturnTransaction = async (id: number): Promise<ReturnTransaction[]> => {
    return await this.http.get(`${this.url}/${id}/return-transaction`);
  };

  getReturnItems = async (id: number) => {
    return await this.http.get(`${this.url}/${id}/return-items`);
  };
}
