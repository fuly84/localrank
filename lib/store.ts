"use client";

import { useSyncExternalStore } from "react";
import { EMPTY_DATA, parseData, STORAGE_KEY, type LocalData } from "./data";

interface Snapshot {
  data: LocalData;
  error: string | null;
  ready: boolean;
}
const SERVER: Snapshot = { data: EMPTY_DATA, error: null, ready: false };
let snapshot: Snapshot | undefined;
const listeners = new Set<() => void>();

function read(): Snapshot {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return {
      data: raw ? parseData(JSON.parse(raw)) : EMPTY_DATA,
      error: null,
      ready: true,
    };
  } catch {
    return {
      data: EMPTY_DATA,
      error:
        "Impossible de lire vos données locales. Elles n’ont pas été écrasées. Importez une sauvegarde ou autorisez le stockage de ce site dans votre navigateur.",
      ready: true,
    };
  }
}

function notify() {
  listeners.forEach((listener) => listener());
}
function onStorage(event: StorageEvent) {
  if (event.key === STORAGE_KEY || event.key === null) {
    snapshot = read();
    notify();
  }
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) window.removeEventListener("storage", onStorage);
  };
}

export function useLocalData() {
  return useSyncExternalStore(
    subscribe,
    () => snapshot ?? (snapshot = read()),
    () => SERVER,
  );
}

/** Save before updating UI so quota/permission failures never look successful. */
export function saveData(data: LocalData): void {
  const safe = parseData(data);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
  } catch {
    throw new Error(
      "Sauvegarde impossible : le stockage est plein ou bloqué. Exportez vos données et vérifiez les réglages de votre navigateur.",
    );
  }
  snapshot = { data: safe, error: null, ready: true };
  notify();
}

export function updateData(update: (data: LocalData) => LocalData): void {
  // Re-read to preserve changes made in another tab immediately before this write.
  const current = read();
  if (current.error) throw new Error(current.error);
  saveData(update(current.data));
}
