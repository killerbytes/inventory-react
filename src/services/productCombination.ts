import {
  BreakPack,
  ProductCombinations,
  ProductCombinationUpdate,
  StockAdjustment,
} from "@/schemas";
import BaseService from "./base";
import type Http from "./http";

export default class ProductCombinationService extends BaseService<ProductCombinations> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/product-combinations" });
  }

  getByProductId = async (id: number) => {
    const response = await this.http.get(`${this.url}/product/${id}`);
    return response;
  };

  updateByProductId = async (
    id: number,
    combinations: ProductCombinationUpdate[],
  ) => {
    const response = await this.http.patch(`${this.url}/product/${id}`, {
      combinations,
    });
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
  search = async (params: {
    search: string;
    limit: number;
    noBreakPacks?: boolean;
  }) => {
    const response = await this.http.get(`${this.url}/search`, {
      params,
    });
    return response;
  };
}
