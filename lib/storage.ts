function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    const storage = window.localStorage;
    if (storage && typeof storage.getItem === "function") {
      return storage;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function storageGet(key: string): string | null {
  return getStorage()?.getItem(key) ?? null;
}

export function storageSet(key: string, value: string): void {
  getStorage()?.setItem(key, value);
}

export function storageRemove(key: string): void {
  getStorage()?.removeItem(key);
}
