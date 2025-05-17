import { ROUTES } from "@/utils/definitions";
import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

export default class Http {
  private axiosInstance: ReturnType<typeof axios.create>;

  constructor() {
    const token = localStorage.getItem(
      `${import.meta.env.VITE_APP_NAME}_TOKEN`
    );

    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
        "x-access-token": token,
      },
    });
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        const { status } = error.response;

        switch (status) {
          case 401:
          case 403:
            window.location = `${ROUTES.LOGIN}?callbackUrl=${window.location.pathname}`;
            return Promise.reject(error);
          default:
            return Promise.reject(error);
        }
      }
    );
  }
  getToken = () => {
    return localStorage.getItem(`${import.meta.env.VITE_APP_NAME}_TOKEN`);
  };
  getHeaders = () => {
    return { headers: { "x-access-token": this.getToken() } };
  };
  get = (url: string, payload: object) => {
    return this.axiosInstance.get(url, {
      ...payload,
      ...this.getHeaders(),
    });
  };
  post = (url: string, data: object, payload: object) => {
    const config = {
      params: payload,
      headers: this.getHeaders(),
    };
    return this.axiosInstance.post(url, data, config);
  };
  patch = (url: string, data: object, payload: object) => {
    const config = {
      params: payload,
      headers: this.getHeaders(),
    };
    return this.axiosInstance.patch(url, data, config);
  };
  delete = (url: string, payload: object) => {
    const config = {
      params: payload,
      headers: this.getHeaders(),
    };
    return this.axiosInstance.delete(url, config);
  };
}
