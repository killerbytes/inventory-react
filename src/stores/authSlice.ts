import { StoreState } from "./store.types";
import { authServices } from "@/services";
import { StateCreator } from "zustand";
import { User } from "@/schemas";

export type AuthState = {
  authState: {
    user: User;
    token: string | null;
    setUser: (user: User) => void;
    setToken: (token: string | null) => void;
    logout: () => void;
  };
};

export const createAuthSlice: StateCreator<
  StoreState,
  [["zustand/immer", never]],
  [],
  AuthState
> = (set) => ({
  authState: {
    user: {} as User,
    token: null,
    setUser: (user: User) =>
      set((state) => {
        state.authState.user = user;
      }),
    setToken: (token: string | null) =>
      set((state) => {
        state.authState.token = token;
      }),
    logout: async () => {
      await authServices.logout();
      window.location.href = "/login";
      set((state) => {
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
