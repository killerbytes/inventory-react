import { User, UserBase, UserForm } from "@/schemas";
import BaseService from "./base";
import type Http from "./http";

export default class UserService extends BaseService<
  User | UserBase | UserForm
> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/users" });
  }
}
