import type { User } from "@/pages/Users";
import BaseService from "./base";
import type Http from "./http";

export default class UserService extends BaseService<User> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/users" });
  }
}
