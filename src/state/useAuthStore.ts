import { create } from "zustand";

type AuthState = {
  accessToken: string | null;
  user: { name: string; avatarUrl?: string } | null;
  setAccessToken: (token: string | null) => void;
  setUser: (user: { name: string; avatarUrl?: string } | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: { name: "Admin User" },
  setAccessToken: (token) => set({ accessToken: token }),
  setUser: (user) => set({ user }),
}));
