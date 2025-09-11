import { ROUTES } from "@/utils/definitions";
import { ApiErrorResponse } from "@/types";
import { toast } from "sonner";
import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

const errorParser = (error) => {
  if (axios.isAxiosError(error) && error.response) {
    throw error.response.data;
  }
  throw error;
};

export default class Http {
  private axiosInstance: ReturnType<typeof axios.create>;

  constructor() {
    const token = localStorage.getItem(
      `${import.meta.env.VITE_APP_NAME}_TOKEN`,
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
        try {
          if (error.code === "ERR_NETWORK") {
            throw error;
          }

          const { status } = error.response || {};
          switch (status) {
            case 401:
            case 403:
              localStorage.removeItem(`${import.meta.env.VITE_APP_NAME}_TOKEN`);

              window.location.href = `${ROUTES.LOGIN}?callbackUrl=${window.location.pathname}`;

              return Promise.reject(error);
            default:
              return Promise.reject(error);
          }
        } catch (error) {
          const apiError = error as ApiErrorResponse;
          toast.error(apiError.message);
        }
      },
    );
  }
  getToken = () => {
    return localStorage.getItem(`${import.meta.env.VITE_APP_NAME}_TOKEN`);
  };
  getHeaders = () => {
    return { "x-access-token": this.getToken() };
  };
  get = async (url: string, payload: object | null = null) => {
    try {
      const res = await this.axiosInstance.get(url, {
        ...payload,
        headers: this.getHeaders(),
      });
      return res.data;
    } catch (error) {
      errorParser(error);
    }
  };
  post = async (url: string, payload: object) => {
    const config = {
      headers: this.getHeaders(),
    };
    try {
      const res = await this.axiosInstance.post(url, payload, config);
      return res.data;
    } catch (error) {
      errorParser(error);
    }
  };
  patch = async (url: string, data: object) => {
    const config = {
      headers: this.getHeaders(),
    };
    try {
      const res = await this.axiosInstance.patch(url, data, config);
      return res.data;
    } catch (error) {
      errorParser(error);
    }
  };
  delete = async (url: string) => {
    const config = {
      headers: this.getHeaders(),
    };
    try {
      const res = await this.axiosInstance.delete(url, config);
      return res.data;
    } catch (error) {
      errorParser(error);
    }
  };
}
