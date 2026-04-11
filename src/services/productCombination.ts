import {
  BreakPackInput,
  ProductCombinationInput,
  StockAdjustment,
} from "@/schemas";
import BaseService from "./base";
import type Http from "./http";

export default class ProductCombinationService extends BaseService<ProductCombinationInput> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/product-combinations" });
  }

  getByIds = async (ids: number[]) => {
    const response = await this.http.post(`${this.url}/get-by-ids`, ids);
    return response;
  };

  updatePrices = async (combinations: ProductCombinationInput[]) => {
    const response = await this.http.patch(
      `${this.url}/update-prices`,
      combinations,
    );
    return response;
  };

  getByProductId = async (id: number) => {
    const response = await this.http.get(`${this.url}/product/${id}`);
    return response;
  };

  getByCategoryId = async (id: number) => {
    const response = await this.http.get(`${this.url}/category/${id}`);
    return response;
  };

  getByBarcode = async (barcode: string) => {
    const response = await this.http.get(`${this.url}/barcode/${barcode}`);
    return response;
  };

  updateByProductId = async (
    id: number,
    combinations: ProductCombinationInput[],
  ) => {
    const response = await this.http.patch(`${this.url}/product/${id}`, {
      combinations,
    });
    return response;
  };

  breakPack = async (payload: BreakPackInput) => {
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
