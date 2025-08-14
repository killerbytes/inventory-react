import { ProductCombinations } from "@/types";
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

  updateByProductId = async (id: number, data: ProductCombinations[]) => {
    const response = await this.http.patch(`${this.url}/product/${id}`, data);
    return response;
  };

  breakPack = async (payload: {
    fromComboId: number;
    toComboId: number;
    packsCount: number;
    unitsPerPack: number;
    reason: string;
  }) => {
    const response = await this.http.post(`${this.url}/breakPack`, payload);
    return response;
  };
}
