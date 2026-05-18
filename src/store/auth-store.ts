"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Owner } from "@/lib/types";

type AuthState = {
  owner: Owner | null;
  isAuthenticated: boolean;
  setAuth: (owner: Owner, token?: string) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      owner: null,
      isAuthenticated: false,
      setAuth: (owner, token) => {
        if (!owner?.id) return;
        if (typeof window !== "undefined") {
          if (token) {
            sessionStorage.setItem("sellpilot_token", token);
            document.cookie = `sellpilot_token=${token}; path=/; SameSite=Lax`;
          } else {
            document.cookie = `sellpilot_token=${owner.id}; path=/; SameSite=Lax`;
          }
        }
        set({ owner, isAuthenticated: true });
      },
      clearAuth: () => {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("sellpilot_token");
          document.cookie = "sellpilot_token=; Max-Age=0; path=/";
        }
        set({ owner: null, isAuthenticated: false });
      }
    }),
    {
      name: "sellpilot_owner",
      partialize: (state) => ({ owner: state.owner, isAuthenticated: state.isAuthenticated })
    }
  )
);
