#!/usr/bin/env node
/**
 * Preload patch for broken Node.js global localStorage.
 * Used via: node --require ./scripts/patch-localstorage.cjs node_modules/.bin/next dev
 */
const g = globalThis;

if (typeof g.localStorage !== "undefined" && typeof g.localStorage.getItem !== "function") {
  const store = new Map();

  const storage = {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    key(index) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key) {
      store.delete(key);
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
  };

  Object.defineProperty(g, "localStorage", {
    value: storage,
    writable: true,
    configurable: true,
  });
}
