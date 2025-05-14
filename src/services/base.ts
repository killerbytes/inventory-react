import type Http from "./http";

export default class BaseService<T> {
  private http: Http;
  private url: string;

  constructor(props: Props) {
    this.http = props.http;
    this.url = props.url;
  }

  create = async (data: T) => {
    const response = await this.http.post(`${this.url}`, data);
    return response;
  };
  get = async (params) => {
    const response = await this.http.get(`${this.url}`, { params });
    return response;
  };

  update = async (id, data) => {
    const response = await this.http.patch(`${this.url}/${id}`, data);
    return response;
  };

  delete = async (id) => {
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
