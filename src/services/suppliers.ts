import type { Supplier } from "@/pages/Suppliers";
import BaseService from "./base";
import type Http from "./http";

export default class UserService extends BaseService<Supplier> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/suppliers" });
  }
}
