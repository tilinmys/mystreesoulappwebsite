import Storage from "../utils/storage";

const memoryStorage = new Map<string, string>();

export const resilientJSONStorage = {
  getItem: async (name: string) => {
    try {
      // [WEB-COMPAT] Replaced SecureStore with Storage
      const value = await Storage.getItem(name);
      return value ?? memoryStorage.get(name) ?? null;
    } catch {
      return memoryStorage.get(name) ?? null;
    }
  },
  setItem: async (name: string, value: string) => {
    memoryStorage.set(name, value);
    try {
      // [WEB-COMPAT] Replaced SecureStore with Storage
      await Storage.setItem(name, value);
    } catch {
      // Keep runtime state alive during native storage hiccups in development.
    }
  },
  removeItem: async (name: string) => {
    memoryStorage.delete(name);
    try {
      // [WEB-COMPAT] Replaced SecureStore with Storage
      await Storage.removeItem(name);
    } catch {
      // See setItem fallback.
    }
  },
};
