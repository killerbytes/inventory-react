import type { Category } from ".";
import BaseService from "./base";
import type Http from "./http";

export default class CategoryService extends BaseService<Category> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/categories" });
  }
}
