import BaseService from "./base";
import type { Category } from "./categories";
import type Http from "./http";

export default class ProductService extends BaseService<Product> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/products" });
  }
}

export interface Product {
  id: number;
  name: string;
  description: string;
  categoryId: string;
  category: Category;
  reorderLevel: number;
}
