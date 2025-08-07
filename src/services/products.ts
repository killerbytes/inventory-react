import { Product } from "@/types";
import BaseService from "./base";
import type Http from "./http";

export default class ProductService extends BaseService<Product> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/products" });
  }
  cloneToUnit = async (id: number, unit: { unit: string }) => {
    const response = await this.http.post(
      `${this.url}/${id}/convertToUnit`,
      unit,
    );
    return response;
  };
}
