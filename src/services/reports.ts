import { filterProps, Payment } from "@/schemas";
import BaseService from "./base";
import type Http from "./http";

export default class ReportService extends BaseService<Payment> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/reports" });
  }

  popular = async (filter: filterProps) => {
    const response = await this.http.get(`${this.url}/popular`, {
      params: filter,
    });
    return response;
  };

  profit = async (filter: filterProps) => {
    const response = await this.http.get(`${this.url}/profit`, {
      params: filter,
    });
    return response;
  };

  noSales = async (filter: filterProps) => {
    const response = await this.http.get(`${this.url}/no-sale`, {
      params: filter,
    });
    return response;
  };
}
