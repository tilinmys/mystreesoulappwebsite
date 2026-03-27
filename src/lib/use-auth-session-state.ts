"use client";

import { useSyncExternalStore } from "react";
import {
  readAuthSession,
  subscribeToAuthSession,
  type AuthSession,
} from "@/lib/auth-session";

export function useAuthSessionState() {
  const session = useSyncExternalStore(
    subscribeToAuthSession,
    readAuthSession,
    () => null,
  );

  return {
    session: session as AuthSession | null,
    isAuthenticated: Boolean(session),
  };
}
