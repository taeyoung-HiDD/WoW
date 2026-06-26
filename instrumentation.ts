/**
 * Node 22+ may expose a broken global `localStorage` when `--localstorage-file`
 * is set without a valid path (common in some IDE terminals). Next.js dev overlay
 * checks `typeof localStorage !== "undefined"` and then calls getItem, which crashes SSR.
 */
function patchBrokenServerLocalStorage() {
  if (typeof globalThis.localStorage === "undefined") return;
  if (typeof globalThis.localStorage.getItem === "function") return;

  const store = new Map<string, string>();

  const storage: Storage = {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
  };

  Object.defineProperty(globalThis, "localStorage", {
    value: storage,
    writable: true,
    configurable: true,
  });
}

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    patchBrokenServerLocalStorage();
  }
}
