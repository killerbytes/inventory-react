import BaseService from "./base";
import { User } from "@/types";
import type Http from "./http";

export default class UserService extends BaseService<User> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/auth" });
  }

  login = async (data: User) => {
    const response = await this.http.post(`${this.url}/login`, data);
    return response;
  };

  me = async () => {
    const response = await this.http.get(`${this.url}/me`);
    return response;
  };
}
