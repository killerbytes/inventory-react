import { Supplier } from "@/types";
import BaseService from "./base";
import type Http from "./http";

export default class CustomerService extends BaseService<Supplier> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/suppliers" });
  }
}
