import { ROUTES } from "@/utils/definitions";
import { ApiErrorResponse } from "@/schemas";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";

const baseURL = import.meta.env.VITE_API_URL;

const errorParser = (error: AxiosError) => {
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
    this.axiosInstance.defaults.withCredentials = true;
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        try {
          if (error.code === "ERR_NETWORK") {
            throw error;
          }

          const { status } = error.response || {};
          switch (status) {
            case 401:
            case 403: {
              const originalRequest = error.config;
              if (!originalRequest._retry) {
                if (originalRequest.url?.includes("/auth/refresh-token")) {
                  return Promise.reject(error);
                }

                originalRequest._retry = true;
                try {
                  const token = await this.refreshToken();
                  originalRequest.headers["x-access-token"] = token;
                  return this.axiosInstance(originalRequest);
                } catch (retryError) {
                  return Promise.reject(retryError);
                }
              }
              return Promise.reject(error);
            }
            default:
              return Promise.reject(error);
          }
        } catch (error) {
          const apiError = error as ApiErrorResponse;
          toast.error(apiError.message);
          return Promise.reject(error);
        }
      },
    );
  }

  private refreshPromise: Promise<string> | null = null;

  refreshToken = async (): Promise<string> => {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      try {
        const { accessToken } = await this.post(
          `/auth${ROUTES.REFRESH}`,
          {},
          { withCredentials: true },
        );

        localStorage.setItem(
          `${import.meta.env.VITE_APP_NAME}_TOKEN`,
          accessToken,
        );
        return accessToken;
      } catch (error) {
        const apiError = error as ApiErrorResponse;
        const currentUrl = window.location.pathname + window.location.search;
        localStorage.setItem("apiError", apiError.message);
        switch (apiError.message) {
          case "Invalid refresh token":
            localStorage.removeItem(`${import.meta.env.VITE_APP_NAME}_TOKEN`);
            window.location.href = `${ROUTES.LOGIN}?callbackUrl=${encodeURIComponent(currentUrl)}`;
            break;
          case "jwt must be provided":
            localStorage.removeItem(`${import.meta.env.VITE_APP_NAME}_TOKEN`);
            window.location.href = `${ROUTES.LOGIN}?callbackUrl=${encodeURIComponent(currentUrl)}`;
            break;
        }
        throw error;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  };
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
      const apiError = error as AxiosError;
      errorParser(apiError);
    }
  };
  post = async (url: string, payload: object, options: object = {}) => {
    const config = {
      headers: this.getHeaders(),
      ...options,
    };
    try {
      const res = await this.axiosInstance.post(url, payload, config);
      return res.data;
    } catch (error) {
      const apiError = error as AxiosError;
      errorParser(apiError);
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
      const apiError = error as AxiosError;
      errorParser(apiError);
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
      const apiError = error as AxiosError;
      errorParser(apiError);
    }
  };
}
