import BaseService from "./base";
import type Http from "./http";

export default class UserService extends BaseService<User> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/users" });
  }
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  isActive: boolean;
  isAdmin: boolean;
  password: string;
  confirmPassword: string;
}
