import { filterProps } from "@/schemas";
import type Http from "./http";

export default class BaseService<T extends object> {
  protected http: Http;
  protected url: string;

  constructor(props: Props) {
    this.http = props.http;
    this.url = props.url;
  }

  create = async (data: T) => {
    const response = await this.http.post(`${this.url}`, data);
    return response;
  };
  getAll = async (params: filterProps) => {
    const response = await this.http.get(`${this.url}/`, { params });
    return response;
  };
  get = async (id: number) => {
    const response = await this.http.get(`${this.url}/${id}`);
    return response;
  };

  update = async (id: number | null, data: T) => {
    const response = await this.http.patch(
      `${this.url}${id ? `/${id}` : ""}`,
      data,
    );
    return response;
  };

  delete = async (id: number) => {
    const response = await this.http.delete(`${this.url}/${id}`);
    return response;
  };

  list = async (params = null) => {
    const response = await this.http.get(`${this.url}/list`, { params });
    return response;
  };
}

interface Props {
  http: Http;
  url: string;
}
