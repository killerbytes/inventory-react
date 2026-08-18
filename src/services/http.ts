import { ROUTES } from "@/utils/definitions";
import { ApiErrorResponse } from "@/schemas";
import axios, { AxiosError } from "axios";
import { useStore } from "@/stores";
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
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
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
            case 403:
              window.location.href = ROUTES.FORBIDDEN;
              throw error;
            case 401: {
              console.log('===> http.ts:43 ~ error', error);
              const originalRequest = error.config;
              console.log('===> http.ts:44 ~ originalRequest', originalRequest);
              if (originalRequest && !originalRequest._retry) {
                if (originalRequest.url?.includes("/auth/refresh-token")) {
                  useStore.getState().authState.setToken(null);
                  if (typeof window !== "undefined" && window.location.pathname !== ROUTES.LOGIN) {
                    const currentUrl =
                      window.location.pathname + window.location.search;
                    window.location.href = `${ROUTES.LOGIN}?callbackUrl=${encodeURIComponent(currentUrl)}`;
                  }
                  throw error;
                }
                originalRequest._retry = true;

                try {
                  const token = await this.refreshToken();
                  originalRequest.headers["x-access-token"] = token;
                  return this.axiosInstance(originalRequest);
                } catch (retryError) {
                  useStore.getState().authState.setToken(null);
                  if (window.location.pathname !== ROUTES.LOGIN) {
                    const currentUrl =
                      window.location.pathname + window.location.search;
                    window.location.href = `${ROUTES.LOGIN}?callbackUrl=${encodeURIComponent(currentUrl)}`;
                  }

                  throw retryError;
                }
              } else {
                useStore.getState().authState.setToken(null);
                if (window.location.pathname !== ROUTES.LOGIN) {
                  const currentUrl =
                    window.location.pathname + window.location.search;
                  window.location.href = `${ROUTES.LOGIN}?callbackUrl=${encodeURIComponent(currentUrl)}`;
                }
              }
              throw error;
            }
            default:
              throw error;
          }
        } catch (error) {
          const axiosError = error as AxiosError<ApiErrorResponse>;
          const apiError = axiosError.response?.data;
          const errorMessage = apiError?.message || axiosError.message;

          const isSilentAuth =
            axiosError.config?.url?.includes("/auth/refresh-token") ||
            (axiosError.response?.status === 401 &&
              (axiosError.config?.url?.includes("/auth/me") ||
                window.location.pathname === ROUTES.LOGIN));

          if (!isSilentAuth) {
            if (errorMessage) {
              toast.error(errorMessage);
            } else {
              toast.error("An unexpected error occurred");
            }
          }

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

        useStore.getState().authState.setToken(accessToken);
        return accessToken;
      } catch (error) {
        const apiError = error as ApiErrorResponse;
        const currentUrl = window.location.pathname + window.location.search;
        if (apiError?.message && typeof localStorage !== "undefined") {
          localStorage.setItem("apiError", apiError.message);
        }

        // On any refresh token failure (401, missing cookie, expired token), clear state & redirect to login
        useStore.getState().authState.setToken(null);
        if (typeof window !== "undefined" && window.location.pathname !== ROUTES.LOGIN) {
          window.location.href = `${ROUTES.LOGIN}?callbackUrl=${encodeURIComponent(currentUrl)}`;
        }
        throw error;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  };
  getToken = () => {
    return useStore.getState().authState.token;
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
  upload = async (url: string, payload: object, options: object = {}) => {
    const config = {
      headers: { ...this.getHeaders(), "Content-Type": undefined },
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
}
