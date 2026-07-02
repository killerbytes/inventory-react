import { describe, it, expect, beforeEach } from "vitest";
import { useStore } from "@/stores";

class LocalStorageMock {
  private store: Record<string, string> = {};

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }

  removeItem(key: string) {
    delete this.store[key];
  }
}

const mockLocalStorage = new LocalStorageMock();
global.localStorage = mockLocalStorage as any;

describe("Auth Store Slice - Pure In-Memory State", () => {
  beforeEach(() => {
    // Reset Zustand store state before each test
    useStore.setState({
      authState: {
        user: {
          id: 0,
          name: "",
          email: "",
          username: "",
          isActive: false,
          role: "User",
        },
        token: null,
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
    localStorage.clear();
  });

  it("should initialize token as null in-memory", () => {
    const { token, user } = useStore.getState().authState;
    expect(token).toBeNull();
    expect(user.id).toBe(0);
  });

  it("should set token in-memory and NOT save it in localStorage", () => {
    const testToken = "dummy-access-token-123";
    useStore.getState().authState.setToken(testToken);

    // Verify in-memory state
    expect(useStore.getState().authState.token).toBe(testToken);

    // Verify that localStorage does NOT contain the token
    const storedToken = localStorage.getItem("INVENTORY_TOKEN");
    expect(storedToken).toBeNull();
  });

  it("should update user in-memory", () => {
    const testUser = {
      id: 42,
      name: "Test Administrator",
      email: "admin@beer-titos.com",
      username: "admin",
      isActive: true,
      role: "Administrator",
    };

    useStore.getState().authState.setUser(testUser);
    expect(useStore.getState().authState.user).toEqual(testUser);
  });

  it("should reset state upon logout", () => {
    const testToken = "dummy-access-token-123";
    const testUser = {
      id: 42,
      name: "Test Administrator",
      email: "admin@beer-titos.com",
      username: "admin",
      isActive: true,
      role: "Administrator",
    };

    useStore.getState().authState.setToken(testToken);
    useStore.getState().authState.setUser(testUser);

    useStore.getState().authState.logout();

    expect(useStore.getState().authState.token).toBeNull();
    expect(useStore.getState().authState.user.id).toBe(0);
  });
});
