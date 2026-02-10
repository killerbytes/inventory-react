import { StoreState } from "./store.types";
import { StateCreator } from "zustand";
import { User } from "@/schemas";

export type AuthState = {
  authState: {
    user: User;
    setUser: (user: User) => void;
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
    setUser: (user: User) =>
      set((state) => {
        state.authState.user = user;
      }),
    logout: () => {
      localStorage.removeItem(`${import.meta.env.VITE_APP_NAME}_TOKEN`);
      window.location.href = "/login";
      set((state) => {
        state.authState.user = {
          id: 0,
          name: "",
          email: "",
          username: "",
          isActive: false,
        };
      });
    },
  },
});
