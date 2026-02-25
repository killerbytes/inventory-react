import { CategoryInput } from "@/schemas";
import BaseService from "./base";
import type Http from "./http";

export default class CategoryService extends BaseService<CategoryInput> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/categories" });
  }

  updateSort = async (data: string[]) => {
    const response = await this.http.patch(`${this.url}/updateSort`, data);

    return response;
  };
}
