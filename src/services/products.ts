import { Product, ProductInput } from "@/schemas";
import BaseService from "./base";
import type Http from "./http";

export default class ProductService extends BaseService<
  Product | ProductInput
> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/products" });
  }

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
  updateSheet = async () => {
    const response = await this.http.post(`${this.url}/updateSheet`, {});
    return response;
  };
  backupDB = async () => {
    const response = await this.http.post(`${this.url}/backup`, {});
    return response;
  };
}
