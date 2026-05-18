import * as SecureStore from "expo-secure-store";

const memoryStorage = new Map<string, string>();

export const resilientJSONStorage = {
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
      // Keep runtime state alive during native storage hiccups in development.
    }
  },
  removeItem: async (name: string) => {
    memoryStorage.delete(name);
    try {
      await SecureStore.deleteItemAsync(name);
    } catch {
      // See setItem fallback.
    }
  },
};
