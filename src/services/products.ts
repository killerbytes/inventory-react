import type { Product } from ".";
import BaseService from "./base";
import type Http from "./http";

export default class ProductService extends BaseService<Product> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/products" });
  }
}
