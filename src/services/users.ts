import BaseService from "./base";
import { User } from "@/types";
import type Http from "./http";

export default class UserService extends BaseService<User> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/users" });
  }
}
