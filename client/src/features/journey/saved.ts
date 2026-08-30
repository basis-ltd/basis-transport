import { useSyncExternalStore } from "react";
import type { SavedItem } from "./types";

const KEY = "basis.saved.v1";
let cache: SavedItem[] = [];
let loaded = false;
const listeners = new Set<() => void>();
function load() {
  if (loaded) return;
  loaded = true;
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || "[]");
    if (Array.isArray(value))
      cache = value
        .filter(
          (v: SavedItem) =>
            v &&
            typeof v.key === "string" &&
            typeof v.label === "string" &&
            typeof v.href === "string" &&
            /^\/(travel\?|stops\/|routes\/)/.test(v.href),
        )
        .slice(0, 100);
  } catch {
    cache = [];
  }
}
const snapshot = () => {
  load();
  return cache;
};
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};
export const useSavedItems = () =>
  useSyncExternalStore(subscribe, snapshot, snapshot);
export function saveItem(item: SavedItem) {
  load();
  const next = [item, ...cache.filter((i) => i.key !== item.key)].slice(0, 100);
  persist(next);
}
export function removeSavedItem(key: string) {
  load();
  persist(cache.filter((i) => i.key !== key));
}
function persist(next: SavedItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    throw new Error(
      "Your browser cannot save favorites. Allow site storage or use a share link.",
    );
  }
  cache = next;
  listeners.forEach((fn) => fn());
}
if (typeof window !== "undefined")
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      loaded = false;
      load();
      listeners.forEach((fn) => fn());
    }
  });
export function savedKey(href: string) {
  let hash = 2166136261;
  for (const char of href)
    hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return `favorite-${(hash >>> 0).toString(16)}`;
}
