import { Customer } from "@/types";
import BaseService from "./base";
import type Http from "./http";

export default class CustomerService extends BaseService<Customer> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/customers" });
  }
}
