import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const TEST_EMAIL = "test@mystreesoul.com";
const TEST_PASSWORD = "password123";
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;
const memoryStorage = new Map<string, string>();

const secureStorage = {
  getItem: async (name: string) => {
    try {
      const value = await SecureStore.getItemAsync(name);
      return value ?? memoryStorage.get(name) ?? null;
    } catch {
      return memoryStorage.get(name) ?? null;
    }
  },
  setItem: async (name: string, value: string) => {
    memoryStorage.set(name, value);
    try {
      await SecureStore.setItemAsync(name, value);
    } catch {
      // Keep dev reloads moving if the native secure storage module is briefly unavailable.
    }
  },
  removeItem: async (name: string) => {
    memoryStorage.delete(name);
    try {
      await SecureStore.deleteItemAsync(name);
    } catch {
      // See setItem fallback.
    }
  }
};

type AuthResult = { ok: true } | { ok: false; message: string };

interface AuthState {
  email: string | null;
  isAuthenticated: boolean;
  sessionExpiresAt: number | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  refreshSession: () => void;
  register: (email: string, password: string) => Promise<AuthResult>;
}

function isValidSession(sessionExpiresAt: number | null) {
  return typeof sessionExpiresAt === "number" && sessionExpiresAt > Date.now();
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      email: null,
      isAuthenticated: false,
      sessionExpiresAt: null,
      login: async (email, password) => {
        await new Promise((resolve) => setTimeout(resolve, 850));
        const normalizedEmail = email.trim().toLowerCase();
        if (normalizedEmail !== TEST_EMAIL || password !== TEST_PASSWORD) {
          return { ok: false, message: "That email or password did not match. Try the test account." };
        }
        set({ email: normalizedEmail, isAuthenticated: true, sessionExpiresAt: Date.now() + SESSION_MS });
        return { ok: true };
      },
      logout: () => set({ email: null, isAuthenticated: false, sessionExpiresAt: null }),
      refreshSession: () => {
        if (get().isAuthenticated) {
          set({ sessionExpiresAt: Date.now() + SESSION_MS });
        }
      },
      register: async (email, password) => {
        await new Promise((resolve) => setTimeout(resolve, 850));
        if (!email.includes("@") || password.length < 8) {
          return { ok: false, message: "Use a valid email and at least 8 characters for testing." };
        }
        set({ email: email.trim().toLowerCase(), isAuthenticated: true, sessionExpiresAt: Date.now() + SESSION_MS });
        return { ok: true };
      }
    }),
    {
      name: "mystree-auth-storage",
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        email: state.email,
        isAuthenticated: state.isAuthenticated && isValidSession(state.sessionExpiresAt),
        sessionExpiresAt: state.sessionExpiresAt
      })
    }
  )
);

export function hasValidAuthSession(state: Pick<AuthState, "isAuthenticated" | "sessionExpiresAt">) {
  return state.isAuthenticated && isValidSession(state.sessionExpiresAt);
}
