import { create } from "zustand";
import { User } from "@/types";

type UserStore = {
  user: User;
  setUser: (user: User) => void;
};

export const useUserStore = create<UserStore>((set) => ({
  user: {} as User,
  setUser: (user: User) => set({ user }),
}));
