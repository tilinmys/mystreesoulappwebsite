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
  /** First time this account became authenticated (registration time for new accounts). */
  accountCreatedAt: number | null;
  /** Last time a session was issued (login or register). */
  lastSessionAt: number | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  refreshSession: () => void;
  register: (email: string, password: string) => Promise<AuthResult>;
}

function isValidSession(sessionExpiresAt: number | null) {
  return typeof sessionExpiresAt === "number" && sessionExpiresAt > Date.now();
}

function isValidEmail(email: string): boolean {
  // Lightweight RFC-ish check — covers most real-world cases without false positives
  // on whitespace-only inputs or strings missing TLDs.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      email: null,
      isAuthenticated: false,
      sessionExpiresAt: null,
      accountCreatedAt: null,
      lastSessionAt: null,
      login: async (email, password) => {
        await new Promise((resolve) => setTimeout(resolve, 850));
        const normalizedEmail = email.trim().toLowerCase();
        if (!isValidEmail(normalizedEmail)) {
          return { ok: false, message: "Please enter a valid email address." };
        }
        if (!password) {
          return { ok: false, message: "Please enter your password." };
        }
        if (normalizedEmail !== TEST_EMAIL || password !== TEST_PASSWORD) {
          return { ok: false, message: "That email or password did not match. Try the test account." };
        }
        const now = Date.now();
        const prevCreated = get().accountCreatedAt;
        set({
          email: normalizedEmail,
          isAuthenticated: true,
          sessionExpiresAt: now + SESSION_MS,
          accountCreatedAt: prevCreated ?? now,
          lastSessionAt: now,
        });
        // Give the persist middleware a tick to flush to secure storage before nav.
        await new Promise((resolve) => setTimeout(resolve, 0));
        return { ok: true };
      },
      logout: () => set({
        email: null,
        isAuthenticated: false,
        sessionExpiresAt: null,
        lastSessionAt: null,
        // Intentionally keep `accountCreatedAt` so analytics can still know
        // when the account first appeared on this device.
      }),
      refreshSession: () => {
        if (get().isAuthenticated) {
          const now = Date.now();
          set({ sessionExpiresAt: now + SESSION_MS, lastSessionAt: now });
        }
      },
      register: async (email, password) => {
        await new Promise((resolve) => setTimeout(resolve, 850));
        const normalizedEmail = email.trim().toLowerCase();
        if (!isValidEmail(normalizedEmail)) {
          return { ok: false, message: "Please enter a valid email address." };
        }
        if (password.length < 8) {
          return { ok: false, message: "Password must be at least 8 characters." };
        }
        const now = Date.now();
        // For a fresh registration we always reset accountCreatedAt to "now"
        // so the session log reflects this signup.
        set({
          email: normalizedEmail,
          isAuthenticated: true,
          sessionExpiresAt: now + SESSION_MS,
          accountCreatedAt: now,
          lastSessionAt: now,
        });
        // Wait for the persist middleware to flush before the caller navigates
        // — prevents a race where the next screen reads stale auth state on cold start.
        await new Promise((resolve) => setTimeout(resolve, 0));
        return { ok: true };
      }
    }),
    {
      name: "mystree-auth-storage",
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        email: state.email,
        isAuthenticated: state.isAuthenticated && isValidSession(state.sessionExpiresAt),
        sessionExpiresAt: state.sessionExpiresAt,
        accountCreatedAt: state.accountCreatedAt,
        lastSessionAt: state.lastSessionAt,
      })
    }
  )
);

export function hasValidAuthSession(state: Pick<AuthState, "isAuthenticated" | "sessionExpiresAt">) {
  return state.isAuthenticated && isValidSession(state.sessionExpiresAt);
}
