import type { User } from ".";
import BaseService from "./base";
import type Http from "./http";

export default class UserService extends BaseService<User> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/users" });
  }
}
