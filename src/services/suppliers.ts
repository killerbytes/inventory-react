import BaseService from "./base";
import type Http from "./http";

export default class UserService extends BaseService<Supplier> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/suppliers" });
  }
}

export interface Supplier {
  id?: number;
  name: string;
  address: string;
  contact: string;
  phone: string;
}
