import { ChangePassword, Login, User } from "@/schemas";
import BaseService from "./base";
import type Http from "./http";

export default class UserService extends BaseService<User> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/auth" });
  }

  login = async (data: Login) => {
    const response = await this.http.post(`${this.url}/login`, data);
    return response;
  };

  logout = async () => {
    const response = await this.http.post(
      `${this.url}/logout`,
      {},
      { withCredentials: true },
    );
    return response;
  };

  me = async () => {
    const response = await this.http.get(`${this.url}/me`);
    return response;
  };
  changePassword = async (data: ChangePassword) => {
    const response = await this.http.post(`${this.url}/changePassword`, data);
    return response;
  };
}
