import type { Product } from "@/pages/Products";
import BaseService from "./base";
import type Http from "./http";

export default class ProductService extends BaseService<Product> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/auth" });
  }

  login = async (data) => {
    const response = await this.http.post(`${this.url}/login`, data);
    return response;
  };

  me = async () => {
    const response = await this.http.get(`${this.url}/me`);
    return response;
  };
}
