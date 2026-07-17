import { ProductCombination, ProductInput } from "@/schemas";
import BaseService from "./base";
import type Http from "./http";

export default class ProductService extends BaseService<
  ProductCombination | ProductInput
> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/products" });
  }
  getByCategory = async (categoryId: number) => {
    const response = await this.http.get(`${this.url}/category/${categoryId}`);
    return response;
  };

  getBySku = async (sku: string) => {
    const response = await this.http.get(`${this.url}/sku/${sku}`);
    return response;
  };

  cloneToUnit = async (id: number, unit: { unit: string }) => {
    const response = await this.http.post(
      `${this.url}/${id}/convertToUnit`,
      unit,
    );
    return response;
  };
}
