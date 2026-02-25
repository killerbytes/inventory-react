import { Customer, CustomerInput } from "@/schemas";
import BaseService from "./base";
import type Http from "./http";

export default class CustomerService extends BaseService<
  Customer | CustomerInput
> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/customers" });
  }
}
