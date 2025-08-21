import { BreakPack, ProductCombinations, StockAdjustment } from "@/types";
import BaseService from "./base";
import type Http from "./http";

export default class ProductCombinationService extends BaseService<ProductCombinations> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/productCombinations" });
  }

  getByProductId = async (id: number) => {
    const response = await this.http.get(`${this.url}/product/${id}`);
    return response;
  };

  updateByProductId = async (
    id: number,
    data: { combinations: ProductCombinations[] },
  ) => {
    const response = await this.http.patch(`${this.url}/product/${id}`, data);
    return response;
  };

  breakPack = async (payload: BreakPack) => {
    const response = await this.http.post(`${this.url}/breakPack`, payload);
    return response;
  };

  stockAdjustment = async (payload: StockAdjustment) => {
    const response = await this.http.post(
      `${this.url}/stockAdjustment`,
      payload,
    );
    return response;
  };
}
