import { Supplier, SupplierInput } from "@/schemas";
import BaseService from "./base";
import type Http from "./http";

export default class SupplierService extends BaseService<
  Supplier | SupplierInput
> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/suppliers" });
  }

  getByProductId = async (id: number) => {
    const response = await this.http.get(`${this.url}/byProductId/${id}`);
    return response;
  };
}
