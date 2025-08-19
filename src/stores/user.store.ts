import { create } from "zustand";
import { User } from "@/types";

type UserStore = {
  user: User;
  setUser: (user: User) => void;
  logout: () => void;
};

export const useUserStore = create<UserStore>((set) => ({
  user: {} as User,
  setUser: (user: User) => set({ user }),
  logout: () => {
    localStorage.removeItem(`${import.meta.env.VITE_APP_NAME}_TOKEN`);
    window.location.href = "/login";
    set({
      user: {
        id: 0,
        name: "",
        email: "",
        username: "",
        isActive: false,
      },
    });
  },
}));
