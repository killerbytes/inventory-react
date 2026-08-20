import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useStore } from "@/stores";
import Http from "@/services/http";

// Create global window and localStorage objects for node environment if not present
if (typeof globalThis.window === "undefined") {
  (globalThis as any).window = {
    location: {
      href: "",
      pathname: "/dashboard",
      search: "",
    },
  };
}

class LocalStorageMock {
  private store: Record<string, string> = {};
  clear() { this.store = {}; }
  getItem(key: string) { return this.store[key] || null; }
  setItem(key: string, value: string) { this.store[key] = String(value); }
  removeItem(key: string) { delete this.store[key]; }
}

if (typeof globalThis.localStorage === "undefined") {
  (globalThis as any).localStorage = new LocalStorageMock();
}

describe("Http Service - 401 Interceptor and Refresh Token Handling", () => {
  beforeEach(() => {
    // Reset Zustand store state before each test
    useStore.setState({
      authState: {
        user: {
          id: 1,
          name: "Test User",
          email: "test@example.com",
          username: "testuser",
          isActive: true,
          role: "User",
        },
        token: "initial-token-123",
        setUser: (user) =>
          useStore.setState((state) => {
            state.authState.user = user;
          }),
        setToken: (token) =>
          useStore.setState((state) => {
            state.authState.token = token;
          }),
        logout: () => {
          useStore.setState((state) => {
            state.authState.user = {
              id: 0,
              name: "",
              email: "",
              username: "",
              isActive: false,
              role: "User",
            };
            state.authState.token = null;
          });
        },
      },
    });

    delete (window as any).location;
    (window as any).location = {
      href: "",
      pathname: "/dashboard",
      search: "",
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should clear auth token when refreshToken fails with generic 401 error", async () => {
    const http = new Http();

    // Mock post to fail (e.g. 401 Unauthorized with generic message)
    vi.spyOn(http, "post").mockRejectedValue({
      message: "Unauthorized",
      statusCode: 401,
    });

    await expect(http.refreshToken()).rejects.toEqual({
      message: "Unauthorized",
      statusCode: 401,
    });

    // Token must be cleared to null regardless of error message
    expect(useStore.getState().authState.token).toBeNull();
  });

  it("should clear auth token and NOT trigger hard window.location redirect when refreshToken fails on a public or protected route", async () => {
    (window as any).location.pathname = "/search";
    (window as any).location.href = "/search?search=tubu";

    const http = new Http();

    vi.spyOn(http, "post").mockRejectedValue({
      message: "Unauthorized",
      statusCode: 401,
    });

    await expect(http.refreshToken()).rejects.toBeDefined();

    expect(useStore.getState().authState.token).toBeNull();
    expect((window as any).location.href).toBe("/search?search=tubu");
  });

  it("should NOT trigger redirect loop if already on LOGIN route when refreshToken fails", async () => {
    (window as any).location.pathname = "/login";
    (window as any).location.href = "/login";

    const http = new Http();

    vi.spyOn(http, "post").mockRejectedValue({
      message: "Unauthorized",
      statusCode: 401,
    });

    await expect(http.refreshToken()).rejects.toBeDefined();

    expect(useStore.getState().authState.token).toBeNull();
    expect((window as any).location.href).toBe("/login");
  });

  it("should configure axiosInstance with a 30000ms timeout for serverless cold starts", () => {
    const http = new Http();
    const axiosInstance = (http as any).axiosInstance;
    expect(axiosInstance.defaults.timeout).toBe(30000);
  });
});
